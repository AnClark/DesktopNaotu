import { addRecentlyRecord } from "./recently";
import { StatusList } from "../define";
import { getAppInstance, showFileName } from "./electron";

/**
 * 当做状态机类用
 */
class NaotuBase {
  /**
   * 当前打开文件的路径
   */
  private _kmPath: string | null;
  public getCurrentKm(): string | null {
    return this._kmPath;
  }
  public setCurrentKm(value: string | null) {
    this._kmPath = value;

    // 记录到配置文件中
    if (value) addRecentlyRecord(value);
  }

  private _state: StatusList;
  public getState() {
    return this._state;
  }
  public setState(str: StatusList) {
    this._state = str;
  }

  // 保存序号
  private _savedNum: number;
  // 修改序号
  private _changedNum: number;

  /**
   * 保存时调用
   */
  public OnSaved() {
    this._savedNum = this._changedNum;
    this.removeUnsavedIndicator();
  }

  /**
   * 修改时调用
   */
  public OnEdited() {
    this._changedNum++;
    this.addUnsavedIndicator();
  }

  /**
   * 是否保存了
   */
  public HasSaved() {
    // 修改的序号 与 保存的序号一致
    return this._changedNum === this._savedNum;
  }

  /**
   * 在标题前加入星号，表示文件已修改
   * 
   * TODO: 考虑自动保存功能打开时，还需不需要显示indicator
   */
  public addUnsavedIndicator() {
    let appInstance = getAppInstance();
    if (appInstance) {
      // 先重设标题，防止星号无限叠加。默认的标题是“文件路径 + 程序名”
      let path = naotuBase.getCurrentKm();
      if (path)   // 如果已打开文件
        showFileName(path);
      else        // 如果未打开文件
        showFileName("");   // 传入空字符串，则只显示程序名

      // 设置标题，加星号
      appInstance.setTitle(`* ${appInstance.getTitle()}`);
    }
  }

  /**
   * 去掉标题前表示已修改的符号（即重设标题）
   */
  public removeUnsavedIndicator() {
    let path = naotuBase.getCurrentKm();
    if (path)
      showFileName(path);
  }

  //#region 单例化
  // 单例对象
  private static instance: NaotuBase;

  /**
   * 私有的构造方法
   */
  private constructor() {
    this._state = "none";
    this._kmPath = null;
    this._changedNum = 0;
    this._savedNum = 0;
  }
  /**
   * 获取日志对象
   */
  public static getInstance(): NaotuBase {
    if (!this.instance) {
      this.instance = new NaotuBase();
    }
    return this.instance;
  }
  //#endregion
}

export let naotuBase: NaotuBase = NaotuBase.getInstance();
