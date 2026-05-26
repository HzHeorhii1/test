import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import {
  NotifyServiceClient,
  SendNotificationRequest,
  SendNotificationResponse,
  NOTIFY_SERVICE_NAME,
} from '@spherax/proto';
import { grpcRetryMutating } from '@spherax/common';

@Injectable()
export class NotifyGrpcClient implements OnModuleInit {
  private notifyService!: NotifyServiceClient;

  constructor(@Inject('NOTIFY_PACKAGE') private readonly client: ClientGrpc) {}

  onModuleInit(): void {
    this.notifyService = this.client.getService<NotifyServiceClient>(NOTIFY_SERVICE_NAME);
  }

  sendNotification(req: SendNotificationRequest): Observable<SendNotificationResponse> {
    return this.notifyService.sendNotification(req).pipe(grpcRetryMutating());
  }
}
