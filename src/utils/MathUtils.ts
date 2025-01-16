import { Vector2 } from 'three';

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;
const DOUBLE_PI = 2 * Math.PI;

export default class MathUtils {
  static round(num: number, precision = 2) {
    const base = 10 ** precision;
    return Math.round(num * base) / base;
  }

  static ceil(num: number, precision = 2) {
    const base = 10 ** precision;
    return Math.ceil(num * base) / base;
  }

  static floor(num: number, precision = 2) {
    const base = 10 ** precision;
    return Math.floor(num * base) / base;
  }

  static format(num: number) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
  }

  /**
   * 获取小数点位数
   */
  static getDecimals(num: number) {
    if (Math.floor(num) === num) {
      return 0;
    }
    return num.toString().split('.')[1].length || 0;
  }

  /**
   * @description mapping degrees to [0, 360] 主要是为了满足前端 ui 习惯使用 0-360 表示角度的要求
   */
  static normalizeDegrees(degrees: number) {
    let result = degrees % 360;
    if (result < 0) {
      result += 360;
    }
    return result;
  }

  /**
   * 返回符合 min、max 的 value 值
   * @param value
   * @param min
   * @param max
   * @returns 符合要求的值
   */
  static clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value));
  }

  /**
   * @param low
   * @param high
   * @returns 返回指定范围内的随机整数值
   */
  static randInt(low: number, high: number) {
    return low + Math.floor(Math.random() * (high - low + 1));
  }

  /**
   * @param low
   * @param high
   * @param count
   * @returns 返回指定数量指定范围内的随机整数数组
   */
  static randIntArray(low: number, high: number, count: number) {
    const list: number[] = [];
    Array.from({ length: count }, () => list.push(MathUtils.randInt(low, high)));
    return list;
  }

  /**
   * 角度转弧度
   * @param degrees 角度
   * @returns
   */
  static degToRad(degrees: number) {
    return degrees * DEG2RAD;
  }

  /**
   * 弧度转角度
   * @param radians 弧度
   * @returns
   */
  static radToDeg(radians: number) {
    return radians * RAD2DEG;
  }

  /**
   * 将弧度规整到 [-2pi, 2pi] 之间
   * @param radians 弧度
   */
  static normalizeRadiansInTwoPI(radians: number) {
    return radians % DOUBLE_PI;
  }

  /**
   * 将弧度规整到 [-pi, pi] 之间
   * @param radians 弧度
   */
  static normalizeRadiansInPI(radians: number) {
    // 规整一下角度
    let res = this.normalizeRadiansInTwoPI(radians);
    if (res > Math.PI) {
      res -= DOUBLE_PI;
    } else if (res < -Math.PI) {
      res += DOUBLE_PI;
    }
    return res;
  }

  /**
   *  @description 归于 [0, 2*PI]
   */
  static normalizePositionAngle(radians: number) {
    return ((radians % DOUBLE_PI) + DOUBLE_PI) % DOUBLE_PI;
  }

  /**
   * 计算两点间距离
   * @param point1
   * @param point2
   * @returns 长度
   */
  static distance(point1: number[], point2: number[]) {
    const distanceToSquared = MathUtils.distanceToSquared(point1, point2);
    return Math.sqrt(distanceToSquared);
  }

  static distanceToSquared(point1: number[], point2: number[]) {
    const xSq = (point1[0] - point2[0]) ** 2;
    const ySq = (point1[1] - point2[1]) ** 2;
    return xSq + ySq;
  }

  /**
   * 计算两点的角度
   * @param start 起点
   * @param end 终点
   * @returns 逆时针为正，顺时针为负的 -180-180 之间的角度值
   */
  static angle(start: number[], end: number[]) {
    const dx = end[0] - start[0];
    const dy = end[1] - start[1];
    return MathUtils.radToDeg(Math.atan2(dy, dx));
  }

  static radian(start: number[], end: number[]) {
    return MathUtils.degToRad(MathUtils.angle(start, end));
  }

  /**
   * 两点之间中点坐标
   * @param point1
   * @param point2
   * @returns 两点之间中点坐标
   */
  static mid(point1: number[], point2: number[]) {
    const [x1, y1] = point1;
    const [x2, y2] = point2;
    const result = [x1 + (x2 - x1) / 2, y1 + (y2 - y1) / 2];
    if (point1.length === 3 && point2.length === 3) {
      result.push(point1[2] + (point2[2] - point1[2]) / 2);
    }
    return result;
  }

  /**
   * 两点是否相同
   */
  static isEqual(point1: number[], point2: number[]) {
    const [x1, y1, z1] = point1;
    const [x2, y2, z2] = point2;
    return x1 === x2 && y1 === y2 && z1 === z2;
  }

  static isAlmostEqual(num1: number, num2: number, tolerance = 1e-6) {
    return Math.abs(num1 - num2) < tolerance;
  }

  static isPointAlmostEqual(point1: number[], point2: number[], tolerance = 1e-6) {
    const [x1 = 0, y1 = 0, z1 = 0] = point1;
    const [x2 = 0, y2 = 0, z2 = 0] = point2;
    return (
      MathUtils.isAlmostEqual(x1, x2, tolerance) &&
      MathUtils.isAlmostEqual(y1, y2, tolerance) &&
      MathUtils.isAlmostEqual(z1, z2, tolerance)
    );
  }

  /**
   * 线性插值
   */
  static lerp(min: number, max: number, ratio: number) {
    return min + (max - min) * ratio;
  }

  /**
   * 判断 x 是否在开区间内
   */
  static inRange(x: number, start: number, end: number, tolerance = 0) {
    const [s, e] = [start, end].sort((a, b) => a - b);
    return x > s - tolerance && x < e + tolerance;
  }

  /**
   * 判断 x 是否在闭区间内
   */
  static inClosedRange(x: number, start: number, end: number, tolerance = 0) {
    const [s, e] = [start, end].sort((a, b) => a - b);
    return x >= s - tolerance && x <= e + tolerance;
  }

  /**
   * 判断 radians 所在区间，返回水平/垂直角度
   */
  static alongAxis(radians: number) {
    if (MathUtils.inRange(radians, -Math.PI / 4, Math.PI / 4)) {
      return 0;
    }
    if (MathUtils.inRange(radians, Math.PI / 4, (Math.PI * 3) / 4)) {
      return Math.PI / 2;
    }
    if (MathUtils.inRange(radians, -(Math.PI * 3) / 4, -Math.PI / 4)) {
      return (Math.PI * 3) / 2;
    }
    return Math.PI;
  }

  /**
   * @description 获取相对 dom 元素的屏幕坐标
   * @param dom 窗口 dom 节点
   * @param mouseEvent 鼠标事件
   */
  static getScreenPosition(dom: HTMLDivElement, clientX: number, clientY: number) {
    const rect = dom.getBoundingClientRect();
    const vector = new Vector2();
    vector.set(clientX - rect.left, clientY - rect.top);
    return vector;
  }

  /**
   * @description 获取相对 dom 元素的归一化坐标，范围 [0, 1]
   * @param dom 窗口 dom 节点
   * @param mouseEvent 鼠标事件
   */
  static getNormalizePosition(dom: HTMLDivElement, clientX: number, clientY: number) {
    const vector = MathUtils.getScreenPosition(dom, clientX, clientY);
    const rect = dom.getBoundingClientRect();
    return new Vector2(vector.x / rect.width, vector.y / rect.height);
  }

  /**
   * @description 将浏览器窗口坐标转 ndc 坐标
   */
  static screenToNdc(dom: HTMLDivElement, clientX: number, clientY: number) {
    const vector = MathUtils.getNormalizePosition(dom, clientX, clientY);
    return new Vector2(vector.x * 2 - 1, -(vector.y * 2) + 1);
  }
}
