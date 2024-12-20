
export type SessionType = {
    ip: string,
    title: string,
    lastActiveDate: Date,
    deviceId: string,
    userId: string
}

export type JwtPayload = {
    userId: string,
    iat: number,
    exp: number,
    deviceId: string
}
export type UpdateSessionType ={
    lastActiveDate: Date;
    deviceId: string;
}

export type requestCountType = {
    ip: string,
    url: string,
    date: Date
}
