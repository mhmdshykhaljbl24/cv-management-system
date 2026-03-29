import prisma from "../utils/prisma.js";
export async function getMyDashboardSummary(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const totalCvs = await prisma.CV.count({
      where: { userId },
    });

    const lastCv = await prisma.CV.findFirst({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        updatedAt: true,
        fullName: true,
        summary: true,
        _count: {
          select: {
            educations: true,
            experiences: true,
            projects: true,
            skills: true,
          },
        },
      },
    });
    let completion = null;

    if (lastCv) {
      const totalPoints = 6;
      let points = 0;

      if (lastCv.fullName && lastCv.fullName.trim().length >= 2) points++;
      if (lastCv.summary && lastCv.summary.trim().length >= 10) points++;

      if ((lastCv._count?.education ?? 0) > 0) points++;
      if ((lastCv._count?.experience ?? 0) > 0) points++;
      if ((lastCv._count?.project ?? 0) > 0) points++;
      if ((lastCv._count?.skill ?? 0) > 0) points++;

      completion = Math.round((points / totalPoints) * 100);
    }

    return res.json({
      totalCvs,
      lastCv: lastCv
        ? { id: lastCv.id, title: lastCv.title, updatedAt: lastCv.updatedAt }
        : null,
      completion,
    });
  } catch (err) {
    next(err);
  }
}
export async function getAdminDashboardSummary(req, res, next) {
  try {
    const email = req.user?.email;
    const ADMINS = ["admin@example.com"];
    if (!email || !ADMINS.includes(email)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const totalUsers = await prisma.user.count();
    const totalCvs = await prisma.CV.count();
    return res.json({
      totalUsers,
      totalCvs,
    });
  } catch (err) {
    next(err);
  }
}
