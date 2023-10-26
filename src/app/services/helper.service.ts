import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { RolesModel } from "../model/model";

@Injectable({
  providedIn: "root",
})
export class HelperService {
  constructor() {}
  public refreshTable = new Subject();

  toParamString(paramObj) {
    if (paramObj) {
      let str = new URLSearchParams(paramObj);
      return `?${str.toString()}`;
    } else {
      return "";
    }
  }

  getUpdatedValue(data, item, key = "uuid") {
    let arr = data.slice();
    let isExist = false;
    arr = arr.map((value) => {
      if (value[key] === item[key]) {
        value = item;
        isExist = true;
      }
      return value;
    });
    if (!isExist) arr.push(item);
    return [...arr];
  }

  checkIfRoleExists(role: string, roles: RolesModel[]) {
    let exists = false;
    roles.forEach((r: RolesModel) => {
      if (r.name == role) {
        exists = true;
      }
    });
    return exists;
  }
}
