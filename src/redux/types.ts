export type FileProgressType = {
  file: fileType;
  progress: number;
};

export type fileType = {
  path: string;
  name: string;
};

export type UploadResultType = {
  file_name: string;
};

export type uploadFileSliceType = {
  file: fileType;
  startAt: Date;
  isCompleted: boolean;
  progress: number;
  isChecked: boolean;
};

export type downloadFileSliceType = {
  file: fileType;
  isCompleted: boolean;
  isInProgress: boolean;
  progress: number;
};

export type userType = {
  id: string;
  password: string;
};

export type userSliceType = {
  id: string | null;
  password: string | null;
  isAuthenticated: boolean;
};

export type uploadEventPayload = {
  file_name: string;
}