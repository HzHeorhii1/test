export { createGrpcClient } from './grpc-client.factory';

export {
  GetUserRequest,
  GetUserResponse,
  CreateUserRequest,
  CreateUserResponse,
  UserServiceClient,
  UserServiceController,
  UserServiceControllerMethods,
  USER_SERVICE_NAME,
  USER_PACKAGE_NAME,
} from './generated/user';

export {
  SendNotificationRequest,
  SendNotificationResponse,
  NotifyServiceClient,
  NotifyServiceController,
  NotifyServiceControllerMethods,
  NOTIFY_SERVICE_NAME,
  NOTIFY_PACKAGE_NAME,
} from './generated/notify';

export { UserProtoMapper } from './mappers/user.proto.mapper';
export { NotifyProtoMapper } from './mappers/notify.proto.mapper';
