import type { ObjectId } from "mongodb"

type Counter = {
  _id: ObjectId
  seq_value: number
}

type PackageNoIds = {
  First: string
  Last: string
  Email: string
  provider: string
  studentId: string
  building?: string // Optional building field
}

type Data = {
  records: Record<string, any>[]
}

type AcProps = {
  apiRoute: string
  // submit: (obj: any | null) => Promise<void>, //TODO: fix
  acLabel: string
  displayOption: (obj: any | null) => string //TODO: Fix,
  // reload: boolean,
  record: Record<string, any> | null
  setRecord: any //TODO: fix
  setLoaded: any //TODO: fix
}

type MaybeData = {
  records: Record<string, any>[] | null
  isLoading: boolean
  isError: Error
}

type Package = {
  _id: ObjectId
  First: string
  Last: string
  Email: string
  packageId: number
  provider: string
  studentId: string
}

type SafeRoster = {
  Last_Name: string
  First_Name: string
  University_ID: string
  Default_Email: string
}

type AmbigiousRoster = SafeRoster & {
  [key: string]: unknown
}

type Roster = SafeRoster & {
  Age: string
  Bed_Space: string
  Rm_Type_Desc: string
}

type Student = SafeRoster & {
  _id: ObjectId
}

type FullStudent = Roster & {
  _id: ObjectId
}

type LogPackageNoId = Omit<Package, "_id"> & {
  ingestedTime: Date
  resolved: boolean
}

type LogPackage = LogPackageNoId & {
  _id: ObjectId
}

type KeyPair = {
  _id: ObjectId
  key: string
  pass: string
}

type DashboardPackage = {
  packageId: number
  name: string
  email: string
  studentId: string
  provider: string
  ingestedTime: string
}

type DashboardLogged = DashboardPackage & {
  retrievedTime: string
}

type Hall = "cobeen" | "mashuda" | "carpenter"

type HallStats = {
  hall: Hall
  packages: DashboardPackage[]
}

type HallLogged = {
  hall: Hall
  packages: DashboardLogged[]
}

type HallTotal = {
  [K in Hall]?: number
}

type MonthData = HallTotal & {
  name: string
}

type WeekData = HallTotal & {
  name: string
}

type DayData = HallTotal & {
  name: string
}

type Month = "Jan" | "Feb" | "Mar" | "Apr" | "May" | "Jun" | "Jul" | "Aug" | "Sep" | "Oct" | "Nov" | "Dec"

type Granularity = "month" | "week" | "day"

export type UserRole = "workspace_admin" | "admin" | "dr"

export interface User {
  _id?: string
  email: string
  name: string
  building: string
  role: UserRole
  passwordHash: string
}

export interface LoginCredentials {
  email: string
  password: string
  building: string
}

export interface AuthResponse {
  success: boolean
  user?: Omit<User, "passwordHash">
  error?: string
  token?: string
}

export interface PreAuthorizedUser {
  _id?: string
  email: string
  name?: string
  building: string
  role: UserRole
  inviteCode: string
  used: boolean
  createdAt: Date
  expiresAt: Date
}

export interface InviteRequest {
  email: string
  name?: string
  building: string
  role: UserRole
}

export interface RegisterRequest {
  email: string
  name: string
  password: string
  inviteCode: string
}

export type {
  HallLogged,
  DashboardLogged,
  Granularity,
  HallTotal,
  MonthData,
  WeekData,
  DayData,
  Month,
  Hall,
  HallStats,
  DashboardPackage,
  Counter,
  PackageNoIds,
  Data,
  AcProps,
  MaybeData,
  Package,
  Student,
  LogPackageNoId,
  LogPackage,
  KeyPair,
  Roster,
  FullStudent,
  SafeRoster,
  AmbigiousRoster,
}

