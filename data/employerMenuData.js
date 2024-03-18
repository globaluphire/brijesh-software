module.exports = [
    {
        id: 1,
        name: "Dashboard",
        icon: "la-home",
        routePath: "/employers-dashboard/dashboard",
        active: "active",
        access: ["SUPER_ADMIN", "ADMIN", "MEMBER"],
    },
    // {
    //   id: 2,
    //   name: "Company Profile",
    //   icon: "la-user-tie",
    //   routePath: "/employers-dashboard/company-profile",
    //   active: "",
    // },
    {
        id: 3,
        name: "Orders",
        icon: "la-paper-plane",
        routePath: "/employers-dashboard/post-jobs",
        active: "",
        access: ["SUPER_ADMIN", "ADMIN", "MEMBER"],
    },
    {
        id: 4,
        name: "Truck Orders",
        icon: "la-shipping-fast",
        routePath: "/employers-dashboard/manage-jobs",
        active: "",
        access: ["SUPER_ADMIN", "ADMIN", "MEMBER"],
    },
    {
        id: 5,
        name: "Tempo Orders",
        icon: "la-truck",
        routePath: "/employers-dashboard/unpublished-jobs",
        active: "",
        access: ["SUPER_ADMIN", "ADMIN", "MEMBER"],
    },
    {
        id: 6,
        name: "Clients",
        icon: "la-users",
        routePath: "/employers-dashboard/all-applicants",
        active: "",
        access: ["SUPER_ADMIN", "ADMIN", "MEMBER"],
    },
    {
        id: 7,
        name: "Billing",
        icon: "la-file-invoice",
        routePath: "/employers-dashboard/rejected-applications",
        active: "",
        access: ["SUPER_ADMIN", "ADMIN", "MEMBER"],
    },
    {
        id: 8,
        name: "LR",
        icon: "la-receipt",
        routePath: "/employers-dashboard/lr",
        active: "",
        access: ["SUPER_ADMIN", "ADMIN", "MEMBER"],
    },
    // {
    //     id: 9,
    //     name: "Withdraw Applicants",
    //     icon: "la-file-invoice",
    //     routePath: "/employers-dashboard/withdrawal-applications",
    //     active: "",
    //     access: ["SUPER_ADMIN", "ADMIN", "MEMBER"],
    // },
    // {
    //   id: 6,
    //   name: "Shortlisted Resumes",
    //   icon: "la-bookmark-o",
    //   routePath: "/employers-dashboard/shortlisted-resumes",
    //   active: "",
    // },
    // {
    //   id: 7,
    //   name: "Packages",
    //   icon: "la-box",
    //   routePath: "/employers-dashboard/packages",
    //   active: "",
    // },
    // {
    //   id: 8,
    //   name: "Messages",
    //   icon: "la-comment-o",
    //   routePath: "/employers-dashboard/messages",
    //   active: "",
    // },
    // {
    //     id: 10,
    //     name: "Reports",
    //     icon: "la-file-invoice",
    //     routePath: "/employers-dashboard/reports",
    //     active: "",
    //     access: ["SUPER_ADMIN"],
    // },
    // {
    //     id: 11,
    //     name: "Resume Alerts",
    //     icon: "la-bell",
    //     routePath: "/employers-dashboard/resume-alerts",
    //     active: "",
    //     access: ["SUPER_ADMIN", "ADMIN", "MEMBER"],
    // },
    // {
    //   id: 10,
    //   name: "Change Password",
    //   icon: "la-lock",
    //   routePath: "/employers-dashboard/change-password",
    //   active: "",
    // },
    {
        id: 12,
        name: "Logout",
        icon: "la-sign-out",
        routePath: "/",
        active: "",
        access: ["SUPER_ADMIN", "ADMIN", "MEMBER"],
    },
    // {
    //   id: 12,
    //   name: "Delete Profile",
    //   icon: "la-trash",
    //   routePath: "/",
    //   active: "",
    // },
];
