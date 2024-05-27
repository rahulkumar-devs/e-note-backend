import { Response } from 'express';

interface IResponse<T> {
  res: Response;
  status: number;
  message?: string;
  success:boolean;
  data?: T;
}

const responseJson = <T>({ res, status, message, data,success }: IResponse<T>) => {
    return res.status(status).json({
      success,
      message,
      data
    });
  };
  
  export default responseJson;