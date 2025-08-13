import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log("Fetching comprehensive analytics data...");

    // Fetch all data with optimized queries and proper error handling
    const [
      destinations,
      events,
      umkm,
      basecamps,
      galleries,
      users,
      submissions,
      analytics,
    ] = await Promise.allSettled([
      // Destinations with enhanced data
      prisma.destination.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          slug: true,
          category: true,
          description: true,
          content: true,
          price: true,
          facilities: true,
          location: true,
          latitude: true,
          longitude: true,
          images: true,
          contact: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),

      // Events with participant tracking
      prisma.event.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          slug: true,
          category: true,
          description: true,
          content: true,
          date: true,
          endDate: true,
          location: true,
          maxParticipants: true,
          currentParticipants: true,
          price: true,
          images: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),

      // UMKM with user relationships
      prisma.uMKM.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              status: true,
              createdAt: true,
            },
          },
        },
      }),

      // Basecamps with full capacity data
      prisma.basecamp.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          namaBasecamp: true,
          fasilitas: true,
          dayaTampungKendaraan: true,
          dayaTampungOrang: true,
          nomorWa: true,
          images: true,
          sosialMedia: true,
          lokasi: true,
          latitude: true,
          longitude: true,
          pemilik: true,
          menuMakanan: true,
          menuMinuman: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),

      // Galleries with proper active field mapping
      prisma.gallery.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          category: true,
          images: true,
          description: true,
          active: true,
          createdAt: true,
          updatedAt: true,
        },
      }),

      // Admin users only with counts
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          createdAt: true,
          _count: {
            select: {
              umkmProducts: true,
              handledSubmissions: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),

      // Submissions with detailed tracking
      prisma.submission.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          subject: true,
          message: true,
          type: true,
          status: true,
          priority: true,
          response: true,
          responseBy: true,
          responseAt: true,
          readAt: true,
          ipAddress: true,
          userAgent: true,
          source: true,
          createdAt: true,
          updatedAt: true,
          handlerId: true,
          handler: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      }),

      // Analytics data for the last 90 days
      prisma.analytics.findMany({
        where: {
          date: {
            gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          },
        },
        orderBy: { date: "desc" },
        select: {
          id: true,
          date: true,
          pageViews: true,
          visitors: true,
          page: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    // Process results and handle failures
    const processedData = {
      destinations:
        destinations.status === "fulfilled" ? destinations.value : [],
      events: events.status === "fulfilled" ? events.value : [],
      umkm: umkm.status === "fulfilled" ? umkm.value : [],
      basecamps: basecamps.status === "fulfilled" ? basecamps.value : [],
      galleries:
        galleries.status === "fulfilled"
          ? galleries.value.map((g) => ({
              ...g,
              isActive: g.active, // Map 'active' to 'isActive' for consistency
            }))
          : [],
      users: users.status === "fulfilled" ? users.value : [],
      submissions: submissions.status === "fulfilled" ? submissions.value : [],
      analytics: analytics.status === "fulfilled" ? analytics.value : [],
    };

    // Log any failures
    const operations = [
      { name: "destinations", result: destinations },
      { name: "events", result: events },
      { name: "umkm", result: umkm },
      { name: "basecamps", result: basecamps },
      { name: "galleries", result: galleries },
      { name: "users", result: users },
      { name: "submissions", result: submissions },
      { name: "analytics", result: analytics },
    ];

    operations.forEach(({ name, result }) => {
      if (result.status === "rejected") {
        console.error(`Failed to fetch ${name}:`, result.reason);
      }
    });

    // Calculate comprehensive statistics
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const stats = {
      destinations: {
        total: processedData.destinations.length,
        active: processedData.destinations.filter((d) => d.isActive).length,
        inactive: processedData.destinations.filter((d) => !d.isActive).length,
        categories: [
          ...new Set(processedData.destinations.map((d) => d.category)),
        ].length,
        withLocation: processedData.destinations.filter(
          (d) => d.latitude && d.longitude
        ).length,
        withImages: processedData.destinations.filter(
          (d) => d.images && d.images.length > 0
        ).length,
        withFacilities: processedData.destinations.filter(
          (d) => d.facilities && d.facilities.length > 0
        ).length,
        withContact: processedData.destinations.filter((d) => d.contact).length,
        recentlyAdded: {
          last7Days: processedData.destinations.filter(
            (d) => new Date(d.createdAt) >= last7Days
          ).length,
          last30Days: processedData.destinations.filter(
            (d) => new Date(d.createdAt) >= last30Days
          ).length,
        },
        topCategories: getTopCategories(processedData.destinations),
      },
      events: {
        total: processedData.events.length,
        active: processedData.events.filter((e) => e.isActive).length,
        inactive: processedData.events.filter((e) => !e.isActive).length,
        upcoming: processedData.events.filter((e) => new Date(e.date) > now)
          .length,
        past: processedData.events.filter((e) => new Date(e.date) <= now)
          .length,
        ongoing: processedData.events.filter((e) => {
          const eventDate = new Date(e.date);
          const endDate = e.endDate ? new Date(e.endDate) : eventDate;
          return eventDate <= now && endDate >= now;
        }).length,
        totalParticipants: processedData.events.reduce(
          (sum, e) => sum + (e.currentParticipants || 0),
          0
        ),
        avgParticipants:
          processedData.events.length > 0
            ? processedData.events.reduce(
                (sum, e) => sum + (e.currentParticipants || 0),
                0
              ) / processedData.events.length
            : 0,
        capacityUtilization: calculateCapacityUtilization(processedData.events),
        withPrice: processedData.events.filter((e) => e.price).length,
        recentlyAdded: {
          last7Days: processedData.events.filter(
            (e) => new Date(e.createdAt) >= last7Days
          ).length,
          last30Days: processedData.events.filter(
            (e) => new Date(e.createdAt) >= last30Days
          ).length,
        },
        topCategories: getTopCategories(processedData.events),
      },
      umkm: {
        total: processedData.umkm.length,
        active: processedData.umkm.filter((u) => u.isActive).length,
        inactive: processedData.umkm.filter((u) => !u.isActive).length,
        withStock: processedData.umkm.filter((u) => u.stock && u.stock > 0)
          .length,
        outOfStock: processedData.umkm.filter((u) => u.stock === 0).length,
        totalStock: processedData.umkm.reduce(
          (sum, u) => sum + (u.stock || 0),
          0
        ),
        avgStock:
          processedData.umkm.length > 0
            ? processedData.umkm.reduce((sum, u) => sum + (u.stock || 0), 0) /
              processedData.umkm.length
            : 0,
        withUsers: processedData.umkm.filter((u) => u.user).length,
        withLocation: processedData.umkm.filter((u) => u.location).length,
        withImages: processedData.umkm.filter(
          (u) => u.images && u.images.length > 0
        ).length,
        categories: [...new Set(processedData.umkm.map((u) => u.category))]
          .length,
        recentlyAdded: {
          last7Days: processedData.umkm.filter(
            (u) => new Date(u.createdAt) >= last7Days
          ).length,
          last30Days: processedData.umkm.filter(
            (u) => new Date(u.createdAt) >= last30Days
          ).length,
        },
        topCategories: getTopCategories(processedData.umkm),
      },
      basecamps: {
        total: processedData.basecamps.length,
        active: processedData.basecamps.filter((b) => b.isActive).length,
        inactive: processedData.basecamps.filter((b) => !b.isActive).length,
        totalCapacityPeople: processedData.basecamps.reduce(
          (sum, b) => sum + (b.dayaTampungOrang || 0),
          0
        ),
        totalCapacityVehicles: processedData.basecamps.reduce(
          (sum, b) => sum + (b.dayaTampungKendaraan || 0),
          0
        ),
        avgCapacityPeople:
          processedData.basecamps.length > 0
            ? processedData.basecamps.reduce(
                (sum, b) => sum + (b.dayaTampungOrang || 0),
                0
              ) / processedData.basecamps.length
            : 0,
        avgCapacityVehicles:
          processedData.basecamps.length > 0
            ? processedData.basecamps.reduce(
                (sum, b) => sum + (b.dayaTampungKendaraan || 0),
                0
              ) / processedData.basecamps.length
            : 0,
        withSocialMedia: processedData.basecamps.filter(
          (b) => b.sosialMedia && b.sosialMedia.length > 0
        ).length,
        withLocation: processedData.basecamps.filter(
          (b) => b.latitude && b.longitude
        ).length,
        withMenus: processedData.basecamps.filter(
          (b) =>
            (b.menuMakanan && b.menuMakanan.length > 0) ||
            (b.menuMinuman && b.menuMinuman.length > 0)
        ).length,
        withImages: processedData.basecamps.filter(
          (b) => b.images && b.images.length > 0
        ).length,
        recentlyAdded: {
          last7Days: processedData.basecamps.filter(
            (b) => new Date(b.createdAt) >= last7Days
          ).length,
          last30Days: processedData.basecamps.filter(
            (b) => new Date(b.createdAt) >= last30Days
          ).length,
        },
      },
      galleries: {
        total: processedData.galleries.length,
        active: processedData.galleries.filter((g) => g.isActive).length,
        inactive: processedData.galleries.filter((g) => !g.isActive).length,
        totalImages: processedData.galleries.reduce(
          (sum, g) => sum + (g.images?.length || 0),
          0
        ),
        avgImagesPerGallery:
          processedData.galleries.length > 0
            ? processedData.galleries.reduce(
                (sum, g) => sum + (g.images?.length || 0),
                0
              ) / processedData.galleries.length
            : 0,
        categories: [...new Set(processedData.galleries.map((g) => g.category))]
          .length,
        withDescription: processedData.galleries.filter((g) => g.description)
          .length,
        recentlyAdded: {
          last7Days: processedData.galleries.filter(
            (g) => new Date(g.createdAt) >= last7Days
          ).length,
          last30Days: processedData.galleries.filter(
            (g) => new Date(g.createdAt) >= last30Days
          ).length,
        },
        topCategories: getTopCategories(processedData.galleries),
      },
      users: {
        total: processedData.users.length,
        admins: processedData.users.filter((u) => u.role === "ADMIN").length,
        regularUsers: processedData.users.filter((u) => u.role === "USER")
          .length,
        active: processedData.users.filter((u) => u.status === "ACTIVE").length,
        inactive: processedData.users.filter((u) => u.status === "INACTIVE")
          .length,
        suspended: processedData.users.filter((u) => u.status === "SUSPENDED")
          .length,
        withUmkm: processedData.users.filter((u) => u._count.umkmProducts > 0)
          .length,
        withSubmissions: processedData.users.filter(
          (u) => u._count.handledSubmissions > 0
        ).length,
        totalUmkmProducts: processedData.users.reduce(
          (sum, u) => sum + (u._count.umkmProducts || 0),
          0
        ),
        totalHandledSubmissions: processedData.users.reduce(
          (sum, u) => sum + (u._count.handledSubmissions || 0),
          0
        ),
        withPhone: processedData.users.filter((u) => u.phone).length,
        recentlyJoined: {
          last7Days: processedData.users.filter(
            (u) => new Date(u.createdAt) >= last7Days
          ).length,
          last30Days: processedData.users.filter(
            (u) => new Date(u.createdAt) >= last30Days
          ).length,
        },
      },
      submissions: {
        total: processedData.submissions.length,
        pending: processedData.submissions.filter((s) => s.status === "PENDING")
          .length,
        read: processedData.submissions.filter((s) => s.status === "READ")
          .length,
        replied: processedData.submissions.filter((s) => s.status === "REPLIED")
          .length,
        closed: processedData.submissions.filter((s) => s.status === "CLOSED")
          .length,
        archived: processedData.submissions.filter(
          (s) => s.status === "ARCHIVED"
        ).length,
        byType: {
          guestbook: processedData.submissions.filter(
            (s) => s.type === "GUESTBOOK"
          ).length,
          volunteer: processedData.submissions.filter(
            (s) => s.type === "VOLUNTEER"
          ).length,
          feedback: processedData.submissions.filter(
            (s) => s.type === "FEEDBACK"
          ).length,
          complaint: processedData.submissions.filter(
            (s) => s.type === "COMPLAINT"
          ).length,
          business: processedData.submissions.filter(
            (s) => s.type === "BUSINESS"
          ).length,
          inquiry: processedData.submissions.filter((s) => s.type === "INQUIRY")
            .length,
          other: processedData.submissions.filter((s) => s.type === "OTHER")
            .length,
        },
        byPriority: {
          low: processedData.submissions.filter((s) => s.priority === "LOW")
            .length,
          normal: processedData.submissions.filter(
            (s) => s.priority === "NORMAL"
          ).length,
          high: processedData.submissions.filter((s) => s.priority === "HIGH")
            .length,
          urgent: processedData.submissions.filter(
            (s) => s.priority === "URGENT"
          ).length,
        },
        withResponse: processedData.submissions.filter((s) => s.response)
          .length,
        withHandler: processedData.submissions.filter((s) => s.handlerId)
          .length,
        withPhone: processedData.submissions.filter((s) => s.phone).length,
        recentlySubmitted: {
          last7Days: processedData.submissions.filter(
            (s) => new Date(s.createdAt) >= last7Days
          ).length,
          last30Days: processedData.submissions.filter(
            (s) => new Date(s.createdAt) >= last30Days
          ).length,
        },
        responseRate:
          processedData.submissions.length > 0
            ? (processedData.submissions.filter(
                (s) => s.status === "REPLIED" || s.status === "CLOSED"
              ).length /
                processedData.submissions.length) *
              100
            : 0,
      },
      analytics: {
        totalPageViews: processedData.analytics.reduce(
          (sum, a) => sum + (a.pageViews || 0),
          0
        ),
        totalVisitors: processedData.analytics.reduce(
          (sum, a) => sum + (a.visitors || 0),
          0
        ),
        uniquePages: [...new Set(processedData.analytics.map((a) => a.page))]
          .length,
        avgPageViewsPerDay:
          processedData.analytics.length > 0
            ? processedData.analytics.reduce(
                (sum, a) => sum + (a.pageViews || 0),
                0
              ) / processedData.analytics.length
            : 0,
        avgVisitorsPerDay:
          processedData.analytics.length > 0
            ? processedData.analytics.reduce(
                (sum, a) => sum + (a.visitors || 0),
                0
              ) / processedData.analytics.length
            : 0,
        last7Days: processedData.analytics
          .filter((a) => new Date(a.date) >= last7Days)
          .reduce((sum, a) => sum + (a.pageViews || 0), 0),
        last30Days: processedData.analytics
          .filter((a) => new Date(a.date) >= last30Days)
          .reduce((sum, a) => sum + (a.pageViews || 0), 0),
        topPages: getTopPages(processedData.analytics),
      },
    };

    // Calculate monthly trends
    const monthlyTrends = calculateMonthlyTrends(processedData);

    // Calculate growth rates
    const growthRates = calculateGrowthRates(processedData, last30Days);

    console.log("Analytics data processed successfully:", {
      destinations: processedData.destinations.length,
      events: processedData.events.length,
      umkm: processedData.umkm.length,
      basecamps: processedData.basecamps.length,
      galleries: processedData.galleries.length,
      users: processedData.users.length,
      submissions: processedData.submissions.length,
      analytics: processedData.analytics.length,
    });

    return NextResponse.json(
      {
        ...processedData,
        stats,
        monthlyTrends,
        growthRates,
        summary: {
          totalItems:
            processedData.destinations.length +
            processedData.events.length +
            processedData.umkm.length +
            processedData.basecamps.length +
            processedData.galleries.length,
          activeItems:
            stats.destinations.active +
            stats.events.active +
            stats.umkm.active +
            stats.basecamps.active +
            stats.galleries.active,
          totalUsers: stats.users.total,
          totalSubmissions: stats.submissions.total,
          totalPageViews: stats.analytics.totalPageViews,
          lastUpdated: new Date().toISOString(),
        },
      },
      {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error("Critical error in analytics API:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch analytics data",
        message: error instanceof Error ? error.message : "Unknown error",
        destinations: [],
        events: [],
        umkm: [],
        basecamps: [],
        galleries: [],
        users: [],
        submissions: [],
        analytics: [],
        stats: null,
        monthlyTrends: [],
        growthRates: null,
        summary: null,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Helper functions
function getTopCategories(
  items: any[]
): Array<{ category: string; count: number; percentage: number }> {
  if (!items || items.length === 0) return [];

  const categoryMap = new Map<string, number>();

  items.forEach((item) => {
    const category = item.category || "Uncategorized";
    categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
  });

  const total = items.length;
  return Array.from(categoryMap.entries())
    .map(([category, count]) => ({
      category,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

function getTopPages(
  analytics: any[]
): Array<{ page: string; views: number; visitors: number }> {
  if (!analytics || analytics.length === 0) return [];

  const pageMap = new Map<string, { views: number; visitors: number }>();

  analytics.forEach((item) => {
    if (!item.page) return;
    const existing = pageMap.get(item.page) || { views: 0, visitors: 0 };
    pageMap.set(item.page, {
      views: existing.views + (item.pageViews || 0),
      visitors: existing.visitors + (item.visitors || 0),
    });
  });

  return Array.from(pageMap.entries())
    .map(([page, data]) => ({
      page,
      views: data.views,
      visitors: data.visitors,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);
}

function calculateCapacityUtilization(events: any[]): number {
  if (!events || events.length === 0) return 0;

  const eventsWithCapacity = events.filter(
    (e) => e.maxParticipants && e.maxParticipants > 0
  );
  if (eventsWithCapacity.length === 0) return 0;

  const totalUtilization = eventsWithCapacity.reduce((sum, e) => {
    return sum + ((e.currentParticipants || 0) / e.maxParticipants) * 100;
  }, 0);

  return totalUtilization / eventsWithCapacity.length;
}

function calculateMonthlyTrends(data: any): any[] {
  const monthMap = new Map<string, any>();

  // Process all data types
  const allItems = [
    ...(data.destinations || []).map((d: any) => ({
      ...d,
      type: "destinations",
    })),
    ...(data.events || []).map((e: any) => ({ ...e, type: "events" })),
    ...(data.umkm || []).map((u: any) => ({ ...u, type: "umkm" })),
    ...(data.basecamps || []).map((b: any) => ({ ...b, type: "basecamps" })),
    ...(data.galleries || []).map((g: any) => ({ ...g, type: "galleries" })),
  ];

  allItems.forEach((item) => {
    if (!item.createdAt) return;
    const date = new Date(item.createdAt);
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;

    const existing = monthMap.get(monthKey) || {
      month: monthKey,
      destinations: 0,
      events: 0,
      umkm: 0,
      basecamps: 0,
      galleries: 0,
      total: 0,
    };

    existing[item.type] += 1;
    existing.total += 1;
    monthMap.set(monthKey, existing);
  });

  return Array.from(monthMap.values())
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12); // Last 12 months
}

function calculateGrowthRates(data: any, last30Days: Date): any {
  const calculateGrowth = (items: any[]) => {
    if (!items || items.length === 0) return 0;

    const recent = items.filter(
      (item) => item.createdAt && new Date(item.createdAt) >= last30Days
    ).length;
    const previous = items.filter((item) => {
      if (!item.createdAt) return false;
      const date = new Date(item.createdAt);
      const previous30Days = new Date(
        last30Days.getTime() - 30 * 24 * 60 * 60 * 1000
      );
      return date >= previous30Days && date < last30Days;
    }).length;

    if (previous === 0) return recent > 0 ? 100 : 0;
    return ((recent - previous) / previous) * 100;
  };

  return {
    destinations: calculateGrowth(data.destinations || []),
    events: calculateGrowth(data.events || []),
    umkm: calculateGrowth(data.umkm || []),
    basecamps: calculateGrowth(data.basecamps || []),
    galleries: calculateGrowth(data.galleries || []),
    users: calculateGrowth(data.users || []),
    submissions: calculateGrowth(data.submissions || []),
  };
}
