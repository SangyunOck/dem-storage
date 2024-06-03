export type setFileProgress = {
  id: number;
  progress: number;
};

export type fileType = {
  path: string;
  name: string;
};

export type uploadFileSliceType = {
  file: fileType;
  id: number;
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
