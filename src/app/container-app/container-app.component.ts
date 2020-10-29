import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ImageInputModel } from '../image-canvas/image-canvas.component';
import { FaceAPIService } from '../services/face.api.service';
import { LoaderService } from '../services/loader.service';

@Component({
  selector: 'app-container-app',
  templateUrl: './container-app.component.html',
  styleUrls: ['./container-app.component.scss']
})

export class ContainerAppComponent implements OnInit, AfterViewInit {
  inputDataImage1: ImageInputModel;
  inputDataImage2: ImageInputModel;
  eventData = {
    Image1: {
      status: false,
      imageLabel: null,
      imageData: null
    },
    Image2: {
      status: false,
      imageLabel: null,
      imageData: null
    }
  }

  constructor(private faceAPIService: FaceAPIService, private loaderService: LoaderService) { }

  ngOnInit() {
    this.inputDataImage1 = { moduleName: "First Image", imageLabel: "Image1" }
    this.inputDataImage2 = { moduleName: "Second Image", imageLabel: "Image2" }
  }

  ngAfterViewInit(): void {
    this.faceAPIService.loadModels()
  }

  faceDetectedEventFunc($event) {
    this.eventData[$event.imageLabel] = $event;
    console.log($event)
  }

  compareFaces() {
    let statusFail = false
    console.log(this.eventData)
    for (const property in this.eventData) {
      if (!(this.eventData[property].status)) {
        statusFail = true;
        break;
      }
    }
    if(statusFail){
      this.faceAPIService.modalMsg(["Please have valid face detected and marked in both images before comparing faces"])
    }else{
      const faceapi = this.faceAPIService.getFaceApi()
      this.loaderService.changeLoaderState(true)
      const faceMatcher = new faceapi.FaceMatcher(this.eventData.Image1.imageData)
      this.loaderService.changeLoaderState(false)
      this.eventData.Image2.imageData.forEach(fd => {
        const bestMatch = faceMatcher.findBestMatch(fd.descriptor)
        if(bestMatch.label == 'unknown'){
          this.faceAPIService.modalMsg(['Face does not match', 'Accuracy is '+ bestMatch.distance * 100])
        }else{
          this.faceAPIService.modalMsg(['Both face matched', 'Accuracy is '+ bestMatch.distance *100])
        }
        console.log(bestMatch)
      })
    }
  }

}
