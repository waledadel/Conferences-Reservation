import { Constants } from "@app/constants";
import { Roles } from "app/shared/models/user";

export class AdminModel {
  panelOpenState = false;
  isMobileView = false;
  menuItems: Array<IMenu> = [];
  pageTitle = '';
}

export interface IMenu {
    url: string;
    text: string;
    icon: string;
    roles: Array<Roles>;
}

export const menuItems: Array<IMenu> = [
  // {
  //   icon: 'dashboard',
  //   text: 'common.dashboard',
  //   url: Constants.Routes.dashboard
  // },
  {
    icon: 'star',
    text: 'menu.major',
    url:  Constants.Routes.primary,
    roles: [Roles.admin, Roles.servant]
  },
  {
    icon: 'people',
    text: 'menu.all',
    url:  Constants.Routes.all,
    roles: [Roles.admin, Roles.servant]
  },
  {
    icon: 'hotel',
    text: 'menu.rooms',
    url:  Constants.Routes.rooms,
    roles: [Roles.admin]
  },
  {
    icon: 'directions_bus',
    text: 'menu.buses',
    url:  Constants.Routes.buses,
    roles: [Roles.admin]
  },
  {
    icon: 'location_on',
    text: 'menu.address',
    url:  Constants.Routes.address,
    roles: [Roles.admin]
  },
  {
    icon: 'bar_chart',
    text: 'menu.statistics',
    url:  Constants.Routes.statistics,
    roles: [Roles.admin]
  },
  {
    icon: 'settings',
    text: 'menu.settings',
    url:  Constants.Routes.settings,
    roles: [Roles.admin]
  },
  {
    icon: 'groups',
    text: 'common.servants',
    url:  Constants.Routes.users,
    roles: [Roles.admin]
  }
];