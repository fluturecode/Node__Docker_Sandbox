import { Catch, ExceptionFilter, ArgumentsHost, HttpException } from "@nestjs/common";
import { CustomException } from "./custom-exception";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: HttpException | unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp(),
      response = ctx.getResponse(),
      customException: CustomException = new CustomException(exception);

    response
      .status(customException.errorResponse.statusCode)
      .json(customException.errorResponse);
  }
}