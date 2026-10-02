export interface Project { id: string; name: string; createdAt: number }

export interface UsagePeriod { start: string; end: string }

export interface Machine {
  id: string;
  projectId: string;
  type: string;
  vehicleType: string;
  vehicleNo: string;
  owner: string;
  startDate: string;
  endDate: string;
  inactive: boolean;
  history: UsagePeriod[];
  createdAt: number;
  updatedAt: number;
}

export interface Reading {
  id: string;
  machineId: string;
  date: string;
  startReading: number;
  startTime: string;
  endReading: number;
  endTime: string;
  total: number;
  createdAt: number;
  updatedAt: number;
}

export interface DetailsInput {
  vehicleType: string; vehicleNo: string; owner: string; startDate: string; endDate: string;
}

export interface ReadingInput {
  machineId: string; date: string; startReading: number; startTime: string; endReading: number; endTime: string;
}
