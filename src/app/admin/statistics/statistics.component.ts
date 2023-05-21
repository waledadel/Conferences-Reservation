import { Component, OnInit } from '@angular/core';
import { AdminService } from '../admin.service';

@Component({
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.updatePageTitle('الإحصائيات');
  }
}
