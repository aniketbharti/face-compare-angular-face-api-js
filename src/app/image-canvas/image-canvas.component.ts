import { EventEmitter, Component, ElementRef, Input, OnInit, Renderer2, ViewChild, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import { FaceAPIService } from '../services/face.api.service';
import { LoaderService} from '../services/loader.service'
@Component({
  selector: 'app-image-canvas',
  templateUrl: './image-canvas.component.html',
  styleUrls: ['./image-canvas.component.scss']
})

export class ImageCanvasComponent implements OnInit {

  @Input() inputData: ImageInputModel;
  @ViewChild('inputCanvas', { static: true }) inputCanvasRef: ElementRef;
  @ViewChild('files', { static: true }) files: ElementRef;
  @Output() faceDetectedEvent: EventEmitter<any>;

  inputCanvas: HTMLCanvasElement;
  inputCanvasContext: CanvasRenderingContext2D;
  imageData: any;
  imageUrl: string;
  allowedFormatArray = ['image/png', 'image/gif', 'image/jpeg'];
  currentFile: any = null;
  emitingData = {
    status: false,
    imageLabel: null,
    imageData: null
  }
  constructor(private renderer: Renderer2, private loaderService: LoaderService, private faceAPIService: FaceAPIService) {
    this.imageUrl = environment.placeHolderImage;
    this.faceDetectedEvent = new EventEmitter<any>();
  }

  ngOnInit() {
    this.inputCanvas = this.inputCanvasRef.nativeElement;
    this.inputCanvasContext = this.inputCanvas.getContext('2d');
    this.imageData = new Image();
    let scale: any;
    this.imageData.onload = () => {
      if (this.imageData.width < this.inputCanvas.width / 2)
        scale = Math.max(this.inputCanvas.width / this.imageData.width, this.inputCanvas.height / this.imageData.height);
      else
        scale = Math.min(this.inputCanvas.width / this.imageData.width, this.inputCanvas.height / this.imageData.height);
      let x = (this.inputCanvas.width / 2) - (this.imageData.width / 2) * scale;
      let y = (this.inputCanvas.height / 2) - (this.imageData.height / 2) * scale;
      this.inputCanvasContext.drawImage(this.imageData, x, y, this.imageData.width * scale, this.imageData.height * scale);
    }
    this.imageData.setAttribute('crossorigin', 'anonymous');
    this.imageData.src = this.imageUrl;
    this.emitingData.imageLabel = this.inputData.imageLabel;
  }

  checkFormat() {
    if (this.files.nativeElement.files.length > 0) {
      if (this.allowedFormatArray.includes(this.files.nativeElement.files[0].type)) {
        if(this.emitingData.status){
          this.emitingData.status = false
          this.emitingData.imageData = null
          this.faceDetectedEvent.emit(this.emitingData)    
        }
        this.currentFile = this.files.nativeElement.files[0]
        this.inputCanvasContext.clearRect(0, 0, this.inputCanvas.width, this.inputCanvas.height); // oops! runs immediately
        this.inputCanvasContext.restore()
        this.renderer.setStyle(this.inputCanvas, 'background-color', 'rgba(0,0,0,.125)');
        this.imageData.src = URL.createObjectURL(this.currentFile);
      } else {
        this.faceAPIService.modalMsg(["Only .jpg .png and .gif are allowed"])
      }
    }
  }

  async detectFace(inputSize = 512) {
    const scoreThreshold = 0.5
    const faceapi = this.faceAPIService.getFaceApi()
    const OPTION = new faceapi.TinyFaceDetectorOptions({
      inputSize,
      scoreThreshold
    })
    const drawOptions = {
      label: this.inputData.imageLabel,
      lineWidth: 2
    }
    this.loaderService.changeLoaderState(true)
    const result = await faceapi.detectAllFaces(this.inputCanvas, OPTION).withFaceLandmarks(true).withFaceDescriptors()
    this.loaderService.changeLoaderState(false)
    if (result.length == 0) {
      this.faceAPIService.modalMsg(["No Face has been detectected. Please seelect another image"])
    } else if (result.length > 1) {
      this.faceAPIService.modalMsg(["Multiple Face has been detected. Please choose Single Face Image"])
    } else {
      const drawBox = new faceapi.draw.DrawBox(result[0].detection.box, drawOptions)
      drawBox.draw(this.inputCanvas)
      this.emitingData.status = true
      this.emitingData.imageData = result
      this.faceDetectedEvent.emit(this.emitingData)
      console.log(result, this.emitingData)
    }
  }


}





export interface ImageInputModel {
  moduleName: string;
  imageLabel: string
}
