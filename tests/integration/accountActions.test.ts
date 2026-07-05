import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const prismaMock = {
    portalProfile: {
      upsert: vi.fn(),
    },
    vacancy: {
      findUnique: vi.fn(),
    },
    user: {
      findFirst: vi.fn(),
    },
    candidate: {
      upsert: vi.fn(),
    },
  };

  return {
    prismaMock,
    resetPrismaClientMock: vi.fn(async () => prismaMock),
    getServerSessionMock: vi.fn(),
    revalidatePathMock: vi.fn(),
  };
});

vi.mock("@/shared/lib/prisma-client", () => ({
  prisma: mocks.prismaMock,
  resetPrismaClient: mocks.resetPrismaClientMock,
}));

vi.mock("@/shared/lib/supabase-server", () => ({
  getServerSession: mocks.getServerSessionMock,
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePathMock,
}));

import {
  applyToVacancyAction,
  getOrCreateProfile,
  updateProfileAction,
} from "@/features/account/api/actions";

describe("account actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.prismaMock.portalProfile.upsert.mockResolvedValue({
      id: "profile_1",
      fullName: "Иван Иванов",
    });
  });

  it("getOrCreateProfile throws when unauthorized", async () => {
    mocks.getServerSessionMock.mockResolvedValue(null);
    await expect(getOrCreateProfile()).rejects.toThrow("Unauthorized");
  });

  it("getOrCreateProfile upserts profile with role and fallback name", async () => {
    mocks.getServerSessionMock.mockResolvedValue({
      user: {
        id: "auth_user_1",
        email: "candidate@example.com",
        app_metadata: { role: "candidate" },
        user_metadata: {},
      },
    });

    await getOrCreateProfile();

    expect(mocks.prismaMock.portalProfile.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { authUserId: "auth_user_1" },
        update: expect.objectContaining({
          email: "candidate@example.com",
          role: "candidate",
          fullName: "candidate",
        }),
      })
    );
  });

  it("updateProfileAction ignores invalid fullName", async () => {
    mocks.getServerSessionMock.mockResolvedValue({
      user: {
        id: "auth_user_1",
        email: "candidate@example.com",
        app_metadata: { role: "candidate" },
      },
    });
    const formData = new FormData();
    formData.set("fullName", "A");
    formData.set("headline", "x");
    formData.set("bio", "y");

    await updateProfileAction(formData);

    expect(mocks.prismaMock.portalProfile.upsert).not.toHaveBeenCalled();
  });

  it("applyToVacancyAction creates/upserts application for candidate", async () => {
    mocks.getServerSessionMock
      .mockResolvedValueOnce({
        user: {
          id: "auth_user_1",
          email: "candidate@example.com",
          app_metadata: { role: "candidate" },
          user_metadata: { full_name: "Иван Иванов" },
        },
      })
      .mockResolvedValueOnce({
        user: {
          id: "auth_user_1",
          email: "candidate@example.com",
          app_metadata: { role: "candidate" },
          user_metadata: { full_name: "Иван Иванов" },
        },
      });

    mocks.prismaMock.vacancy.findUnique.mockResolvedValue({
      id: "vac_1",
      stages: [{ id: "stage_1" }],
    });
    mocks.prismaMock.user.findFirst.mockResolvedValue({ id: "recruiter_1" });

    const formData = new FormData();
    formData.set("vacancyId", "vac_1");

    await applyToVacancyAction(formData);

    expect(mocks.prismaMock.candidate.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          vacancyId_portalProfileId: {
            vacancyId: "vac_1",
            portalProfileId: "profile_1",
          },
        },
      })
    );
    expect(mocks.revalidatePathMock).toHaveBeenCalledWith("/jobs");
  });

  it("applyToVacancyAction does nothing for employer", async () => {
    mocks.getServerSessionMock.mockResolvedValue({
      user: {
        id: "auth_user_1",
        email: "employer@example.com",
        app_metadata: { role: "admin" },
      },
    });

    const formData = new FormData();
    formData.set("vacancyId", "vac_1");
    await applyToVacancyAction(formData);

    expect(mocks.prismaMock.candidate.upsert).not.toHaveBeenCalled();
    expect(mocks.revalidatePathMock).not.toHaveBeenCalled();
  });
});
