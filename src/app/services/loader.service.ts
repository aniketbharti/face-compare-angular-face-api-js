import { Subject, Observable } from 'rxjs';

export class LoaderService {
  loaderSubject: Subject<any>;
  
  constructor() {
    this.loaderSubject = new Subject();
  }
  
  changeLoaderState(loaderOptions:boolean) {
    this.loaderSubject.next(loaderOptions);
  }

  loaderListener(): Observable<boolean> {
    return this.loaderSubject.asObservable();
  }
}

