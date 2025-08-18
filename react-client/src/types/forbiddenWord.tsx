export interface ForbiddenWord {
    forbiddenWordId: number;
    word: string;
    lgroup: string;
    mgroup: string;
    sgroup: string;
    dgroup: string;
    companyCode: string;
    startDate: Date;
    endDate: Date;
    reason: string
}