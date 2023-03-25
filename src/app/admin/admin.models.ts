import { Constants } from "@app/constants";

export class AdminModel {
  panelOpenState = false;
  arabic = Constants.Languages.ar;
  english = Constants.Languages.en;
  selectedLanguage: string;
  menu: Array<IMenu> = [
    // {
    //   icon: 'dashboard',
    //   text: 'common.dashboard',
    //   url: Constants.Routes.dashboard
    // },
    {
      icon: 'star',
      text: 'menu.major',
      url:  Constants.Routes.primary
    },
    {
      icon: 'people',
      text: 'menu.all',
      url:  Constants.Routes.all
    },
    {
      icon: 'hotel',
      text: 'menu.rooms',
      url:  Constants.Routes.rooms
    },
    {
      icon: 'directions_bus',
      text: 'menu.buses',
      url:  Constants.Routes.buses
    },
    {
      icon: 'location_on',
      text: 'menu.address',
      url:  Constants.Routes.address
    },
    {
      icon: 'bar_chart',
      text: 'menu.statistics',
      url:  Constants.Routes.statistics
    },
    {
      icon: 'settings',
      text: 'menu.settings',
      url:  Constants.Routes.settings
    },
    // {
    //   icon: 'groups',
    //   text: 'common.users',
    //   url:  Constants.Routes.users
    // }
  ];

  constructor() {
    this.selectedLanguage = this.arabic;
  }
}

export interface IMenu {
    url: string;
    text: string;
    icon: string;
}
