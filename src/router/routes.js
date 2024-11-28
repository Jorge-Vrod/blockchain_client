import DashboardLayout from "@/layout/dashboard/DashboardLayout.vue";
import NotFound from "@/pages/NotFoundPage.vue";

const Dashboard = () =>
  import(/* webpackChunkName: "dashboard" */ "@/pages/Dashboard.vue");
const Profile = () =>
  import(/* webpackChunkName: "common" */ "@/pages/Profile.vue");
const Notifications = () =>
  import(/* webpackChunkName: "common" */ "@/pages/Notifications.vue");
const Icons = () =>
  import(/* webpackChunkName: "common" */ "@/pages/Icons.vue");
const Maps = () => import(/* webpackChunkName: "common" */ "@/pages/Maps.vue");
const Typography = () =>
  import(/* webpackChunkName: "common" */ "@/pages/Typography.vue");
const TableList = () =>
  import(/* webpackChunkName: "common" */ "@/pages/TableList.vue");
const CampaignPage = () =>
  import(/* webpackChunkName: "common" */ "@/components/Campaign/CampaignPage.vue");
const CreateCampaignPage = () =>
  import(/* webpackChunkName: "common" */ "@/components/Campaign/CreateCampaignPage.vue");

const routes = [
  {
    path: "/",
    component: DashboardLayout,
    redirect: "/dashboard",
    children: [
      {
        path: "dashboard",
        name: "dashboard",
        component: Dashboard,
      },
      {
        path: "/campaign/:id",
        name: "CampaignPage",
        component: CampaignPage,
        props: true,
      },
      {
        path: "/create-campaign",
        name: "CreateCampaignPage",
        component: CreateCampaignPage,
        props: true,
      },
      {
        path: "profile",
        name: "profile",
        component: Profile,
      },
      {
        path: "notifications",
        name: "notifications",
        component: Notifications,
      },
      {
        path: "icons",
        name: "icons",
        component: Icons,
      },
      {
        path: "maps",
        name: "maps",
        component: Maps,
      },
      {
        path: "typography",
        name: "typography",
        component: Typography,
      },
      {
        path: "table-list",
        name: "table-list",
        component: TableList,
      },
    ],
  },
  // Exclude requests for static assets
  {
    path: "/images/:file",
    name: "static-files",
    beforeEnter: () => {
      // Let static files bypass Vue Router
      return true;
    },
  },
  { path: "*", component: NotFound },
];

export default routes;
