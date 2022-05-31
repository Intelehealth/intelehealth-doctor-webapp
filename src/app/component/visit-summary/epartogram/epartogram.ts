export class epartogram {
    id: number;
    time: string;
    uuid: string;
    companion:Object;
    painRelief: Object;
    oralFluid:Object;
    posture:Object;
    baselineFHR:Object;
    fhrDeceleration:Object;
    amnioticfluid:Object;
    fetalPosition:Object;
    caput:Object;
    moulding: Object;
    pulse:Object;
    systolicBP: Object;
    diastolicBP:Object;
    temperature:Object;
    urine:Object;
    contractions:Object;
    durationOfContraction:Object;
    cervix:Object;
    descent:Object;
    oxytocin:string;
    medicine:string;
    ivfluids:string;
    assessment:string;
    plan:string;
    initals:string;

    constructor(id: number,  time: string, uuid: string,companion:Object,painRelief: Object,oralFluid:Object, posture:Object,baselineFHR:Object,
        fhrDeceleration:Object,amnioticfluid:Object, fetalPosition:Object, caput:Object, moulding: Object, pulse:Object,systolicBP: Object, 
        diastolicBP:Object, temperature:Object,urine:Object,contractions:Object,durationOfContraction:Object,cervix:Object,descent:Object,
        oxytocin:string,medicine:string,ivfluids:string,assessment:string,plan:string, initials:string) {
        this.id =  id;
        this.time = time;
        this.uuid = uuid;
        this.companion = companion;
        this.painRelief = painRelief;
        this.oralFluid = oralFluid;
        this.posture= posture;
        this.baselineFHR =baselineFHR;
        this.fhrDeceleration =fhrDeceleration;
        this.amnioticfluid = amnioticfluid;
        this.fetalPosition = fetalPosition;
        this.caput =caput;
        this.moulding =  moulding;
        this.pulse = pulse;
        this.systolicBP = systolicBP;
        this.diastolicBP = diastolicBP;
        this.temperature = temperature;
        this.urine = urine;
        this.contractions = contractions;
        this.durationOfContraction = durationOfContraction;
        this.cervix = cervix;
        this.descent = descent;
        this.oxytocin = oxytocin;
        this.medicine = medicine;
        this.ivfluids = ivfluids;
        this.assessment = assessment;
        this.plan = plan;
        this.initals = initials;
    }
}