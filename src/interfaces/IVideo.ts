export interface IVideo {
  id: string;
  userId: string;
  name: string;
  description: string;
  isProcessed: boolean;
  angleOfShot: AngleOfShot;
  typeOfShot: TypeOfShot;
  storageUri: string;
  feedback: IFeedback | null;
  createdTimestamp: number;
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
