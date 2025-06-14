import { Component } from '@angular/core';
import { SideBar } from './side-bar/side-bar';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [SideBar, RouterOutlet],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
