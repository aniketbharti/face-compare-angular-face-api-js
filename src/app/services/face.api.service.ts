import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ModalComponent } from '../modal/modal.component';
import { LoaderService } from './loader.service';

declare const faceapi: any;
@Injectable()

export class FaceAPIService {

    constructor(private dialog: MatDialog, private loaderService: LoaderService) { }
   
    async loadModels() {
        this.loaderService.changeLoaderState(true)
        await faceapi.nets.tinyFaceDetector.loadFromUri('./assets/models/')
        await faceapi.loadFaceLandmarkTinyModel('./assets/models/')
        await faceapi.loadFaceRecognitionModel('./assets/models/')
        setTimeout(()=>{
            this.loaderService.changeLoaderState(false)
        },3000)
    }

    getFaceApi() {
        return faceapi
    }

    modalMsg(msg) {
        this.dialog.open(ModalComponent, {
            width: "350px",
            data: {
                message: msg,
                button: ["OK"]
            }
        })
    }
}