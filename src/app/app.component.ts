import { ChangeDetectorRef, Component, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoaderService } from './services/loader.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit, OnDestroy {
  loaderSubscription: Subscription;
  title: any
  state: any = true;
  location: any;
  constructor(private loaderService: LoaderService, private cd: ChangeDetectorRef) {
  }


  ngOnInit(): void {
    this.title = 'common-lib';
    this.loaderSubscription = this.loaderService.loaderListener().subscribe((res: boolean) => {
      this.state = res
    })
  }
  ngOnDestroy(): void {
    this.loaderSubscription.unsubscribe()
  }
}
