export interface IVideo {
  id: string;
  user_id: string;
  name: string;
  description: string;
  is_processed: boolean;
  angle_of_shot: AngleOfShot;
  type_of_shot: TypeOfShot;
  storage_uri: string;
  feedback: IFeedback | null;
  uploaded_timestamp: Date;
}

export interface IFeedback {
  multiAxis: string;
  singleAxis: string;
  angle: string;
}

export enum AngleOfShot {
  SIDE_ON = "side on",
  FRONT_FACING = "front facing",
  FROM_THE_BACK = "from the back",
}

export enum TypeOfShot {
  FREE_THROW = "free throw",
  THREE_POINTER = "three pointer",
}
