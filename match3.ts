'use strict';

export namespace Match3 {

class Dictionary<T>{
    [index : number] : T;
}

class Dic<T1, T2>{
  public key : T1[];
  private val : (T2 | null)[];

  constructor()
  {
    this.key = [];
    this.val = [];
  }

  set(k: T1, v : T2)
  {
    let idx = this.key.indexOf(k);
    if(idx == -1)
    {
      this.key.push(k);
      this.val.push(v);
    }
    else
    {
      this.val[idx] = v;
    }
  }

  remove(k: T1)
  {
    let idx = this.key.indexOf(k);
    if(idx != -1)
    {
      this.key.splice(idx, 1);
      this.val.splice(idx, 1);
    }
  }

  getVal(k: T1) : { result : boolean, val : (T2 | null)}
  {
    let rtn : { result : boolean, val : (T2 | null)}  = { result : false , val :  null}; 
    let idx = this.key.indexOf(k);
    if(idx != -1)
    {
      rtn.result = true;
      rtn.val = this.val[idx];
    }

    return rtn;
  }

  isExist(k: T1) : boolean
  {
    let idx = this.key.indexOf(k);
    return (idx != -1);
  }


  size()
  {
    return this.key.length;
  }
}


class GridPos {
  public x:number;
  public y:number;
  constructor(vx: number, vy: number) {
    this.x = vx;
    this.y = vy;
  }
}

class MatchRecord {
  private m_x1 : number;
  private m_y1 : number;
  private m_x2 : number;
  private m_y2 : number;
  
  constructor(x1 : number, y1: number, x2: number, y2: number) {
    this.m_x1 = x1;
    this.m_y1 = y1;
    this.m_x2 = x2;
    this.m_y2 = y2;
  }

  IsInside(x : number, y : number) {
    return x >= this.m_x1 && x <= this.m_x2 && y >= this.m_y1 && y <= this.m_y2;
  }

  IsVertical() {
    return this.m_y1 == this.m_y2;
  }

  IsHorizontal() {
    return this.m_x1 == this.m_x2;
  }

  IsSquare() {
    return (Math.abs(this.m_x1 - this.m_x2) == 1) && (Math.abs(this.m_y1 - this.m_y2) == 1);
  }

  GetGridPos() {
    let List : GridPos[] = [];

    for (let i = this.m_x1; i <= this.m_x2; ++i) {
      for (let j = this.m_y1; j <= this.m_y2; ++j) {
        List.push(new GridPos(i, j));
      }
    }
    return List;
  }
}

class MatchGrid {
  public m_BasePos : GridPos;
  public Recs : MatchRecord[];
  public m_AllGrid : GridPos[];
  public m_v : number;
  public m_h : number;
  public m_s : number;

  constructor(x : number, y : number) {
    this.m_BasePos = new GridPos(x, y);
    this.Recs = [];
    this.m_AllGrid = [];
    this.m_v = 0;
    this.m_h = 0;
    this.m_s = 0;
  }

  AddMatchRecord(Rec : MatchRecord) 
  {
    this.Recs.push(Rec);
    if (Rec.IsVertical())
      this.m_v++;
    else if (Rec.IsHorizontal())
      this.m_h++;
    else if (Rec.IsSquare())
      this.m_s++;

    let PosList = Rec.GetGridPos();
    for (let i = 0; i < PosList.length; ++i) {
      if (this.m_AllGrid.indexOf(PosList[i]) == -1) {
        this.m_AllGrid.push(PosList[i]);
      }
    }
  }

  BasePos() { return this.m_BasePos; }
  AllPos() { return this.m_AllGrid; }

  IsMatch5() {
    return this.m_v == 3 || this.m_h == 3;
  }

  IsMatchT() {
    return this.m_v >= 1 && this.m_h >= 1;
  }

  IsMatch4() {
    return this.m_v >= 2 || this.m_h >= 2;
  }

  IsMatchS() {
    return this.m_s == 4;
  }

  IsMatch3() {
    return this.m_v >= 1 || this.m_h >= 1;
  }
}

class SpecialRemove {
  private m_Style: number;
  private m_PosList : number[];

  constructor(style : number)
  {
    this.m_Style = style;
    this.m_PosList = [];
  }

  Enqueue(Idx: number) {
    this.m_PosList.push(Idx);
  }
  
  EnqueueList(Idxs: number[]) {
    for (let i = 0; i < Idxs.length; ++i) {
      this.m_PosList.push(Idxs[i]);
    }
  }
  
  Dequeue() : { val : number, result : boolean} {
    let rtn : { val : number, result : boolean} = { val : 0, result : false};
    if (this.m_PosList.length == 0)
      rtn.result = false;
    rtn.val = this.m_PosList[0];
    this.m_PosList.splice(0, 1);
    rtn.result = true;
  
    return rtn;
  }
}

class MoveRecord{
  private m_x : number;
  private m_y : number;
  private m_direction : number;

  constructor(x: number, y: number, direction: number)
  {
    this.m_x = x;
    this.m_y = y;
    this.m_direction = direction;
  }

  IsEqual(x: number, y: number, dir: number) {
    return x == this.m_x && y == this.m_y && this.m_direction == dir;
  }
}


enum SwipeRecordState
{
  START = 0,
  REVERT= 1,
  END= 2
}

class SwipeRecord
{
  public readonly m_Pos1 :GridPos;
  public readonly m_Pos2 :GridPos;
  private m_State : SwipeRecordState;

  constructor(Pos1 : GridPos, Pos2 : GridPos, s : SwipeRecordState)
  {
    this.m_Pos1 = Pos1;
    this.m_Pos2 = Pos2;
    this.m_State = s;
  }
  
  Pos1() { return this.m_Pos1; }
  Pos2() { return this.m_Pos2; }
  
  SetChanged() {
    this.m_State = SwipeRecordState.END;
  }
  
  IsStart() {
    return this.m_State == SwipeRecordState.START;
  }
  
  IsEnd() {
    return this.m_State == SwipeRecordState.END;
  }
}


enum GemState 
{
  Idle = 1,
  Moving = 2, 
  Clear = 3, 
}

enum GemType
{
  Normal= 0, 
  LineColumn= 1, 
  LineRow= 2, 
  Bomb= 3, 
  Wildcard= 4, 
  Cross= 5
}

class Gem{
  private m_Color :number;
  public  m_TempPos :GridPos;
  private m_Type : GemType;
  private m_State : GemState;
  private m_Callback : Function | null;
  private m_Countdown : number;

  get color(){return this.m_Color; };
  get type(){return this.m_Type; };

  constructor(Color : number, Pos :GridPos) {
    this.m_Color = Color;
    this.m_TempPos = Pos;
    this.m_Type = GemType.Normal;
    this.m_State = GemState.Idle;
    this.m_Callback = null;
    this.m_Countdown = 0;
  }


  IsCanMove() {
    return this.m_State == GemState.Idle;
  }
  
  Update(DeltaTime: number) {
    this.m_Countdown -= DeltaTime;
    if (this.m_Countdown <= 0) {
      this.m_State = GemState.Idle;
      if (this.m_Callback != null)
        this.m_Callback(this);
  
    }
  }
  
  SetCountdown(Cnt : number, Callback : Function | null = null) {
    this.m_Countdown = Cnt;
    this.m_State = GemState.Moving;
    this.m_Callback = Callback;
  }
  
  SetClear() {
    this.m_State = GemState.Clear;
  }
  
  IsClear() {
    return this.m_State == GemState.Clear;
  }
}


class GridState{
  private m_Gem : Gem | null;
  constructor()
  {
    this.m_Gem = null;
  }

  get gem(): Gem | null {
    return this.m_Gem;
  }

  set gem(argGem : Gem  | null){
    this.m_Gem = argGem;
  }

  GenGem(Color: number, Pos: GridPos) {
    if (this.m_Gem == null) {
      this.m_Gem = new Gem(Color, Pos);
    }
  };
  
 
  IsCanMove() {
    if (this.m_Gem == null) return false;
    return this.m_Gem.IsCanMove();
  }
  
  Clear() {
    if(this.m_Gem)
      this.m_Gem.SetClear();
  }

  RemoveGem()
  {
    this.m_Gem = null;
  }
}


export enum Direction {
  DOWN= 0,
  UP= 1,
  LEFT= 2,
  RIGHT= 3,
  LD= 4,
  RD= 5,
  LU= 6,
  RU= 7,
  MAX= 8
}

const WAIT_UPDATE_TIME_UNIT = 500;
const WAIT_UPDATE_TIME_UNIT2 = 300;
const WAIT_CLEAR_TIME_UNIT = 300;

export class Match3Main
{

  public m_CBGenerate: Function | null = null;
  public m_CBClear: Function | null = null;
  public m_CBMove: Function | null = null;
  public m_CBLock: Function | null = null;
  public m_CBLog: Function | null = null;
  public m_CBLog2: Function | null = null;

  private m_SwipeRecs : SwipeRecord[] = [];
  private m_Grid :GridState[] = [];
  m_PossibleMove : MoveRecord[] = [];
  m_MatchRecs: MatchRecord[] = [];
  m_GemForceRemoveList : SpecialRemove[] = [];
  m_IsHasMatch: Boolean = false;

  private m_Row : number;
  private m_Col : number;
  private m_ColorCount : number;

  constructor(col_cnt : number, row_cnt : number, color_cnt : number) {
    this.m_Row = row_cnt;
    this.m_Col = col_cnt;
    this.m_ColorCount = color_cnt;
  }

  update(time_unit : number) {

    this.UpdateSwipe();
    this.updateGem(time_unit);

    this.ScanMatch();

    this.SpecialRemoveGem();
    this.GemDrop();
    this.generate(false);
    this.ScanMatchPossible();

  }


  SpecialRemoveGem() {
    for (var i = 0; i < this.m_GemForceRemoveList.length; ++i) {
      var SpRemove = this.m_GemForceRemoveList[i];

      var PosIdx = 0, x = 0, y = 0;
      //while (SpRemove.Dequeue(ref PosIdx))
      while (true) {
        let rtn = SpRemove.Dequeue();
        if (rtn.result == false) break;

        var p = this.GridIdxToPos(rtn.val);
        x = p.x;
        y = p.y;
        var idx = rtn.val;
        
        let gem = this.m_Grid[idx].gem;
        
        if (gem == null || !gem.IsCanMove())
          continue;

        gem.SetCountdown(WAIT_UPDATE_TIME_UNIT, this.OnGemMatchClear);
        if (this.m_CBClear != null) {
          this.m_CBClear(x, y);
        }
      }
      
    }

    this.m_GemForceRemoveList.length = 0;
  }

  OnGemMatchClear(TargetGem : Gem) // Gem
  {
    TargetGem.SetClear();

    if (TargetGem.type == GemType.LineColumn) {
      // test
      var SpMove = new SpecialRemove(TargetGem.type);
      this.m_GemForceRemoveList.push(SpMove);
      for (let i = 0; i < this.m_Row; ++i) {
        let idx = this.GridPosToIdx2(TargetGem.m_TempPos.x, i);
        let gem = this.m_Grid[idx].gem;
        if (gem != null && gem.IsCanMove()) {
          SpMove.Enqueue(this.GridPosToIdx2(TargetGem.m_TempPos.x, i));
        }
      }

    }
    if (TargetGem.type == GemType.LineRow) {
      var SpMove = new SpecialRemove(TargetGem.type);
      this.m_GemForceRemoveList.push(SpMove);

      for (let i = 0; i < this.m_Col; ++i) {
        let idx = this.GridPosToIdx2(i, TargetGem.m_TempPos.y);
        let gem = this.m_Grid[idx].gem;
        if (gem != null && gem.IsCanMove()) {
          SpMove.Enqueue(this.GridPosToIdx2(i, TargetGem.m_TempPos.y));
        }
      }
    }


    if (TargetGem.type == GemType.Bomb) {
      var ColMin = TargetGem.m_TempPos.x - 1;
      if (ColMin < 0) ColMin = 0;
      var ColMax = TargetGem.m_TempPos.x + 1;
      if (ColMax >= this.m_Col) ColMax = this.m_Col - 1;
      var RowMin = TargetGem.m_TempPos.y - 1;
      if (RowMin < 0) RowMin = 0;
      var RowMax = TargetGem.m_TempPos.y + 1;
      if (RowMax >= this.m_Row) RowMax = this.m_Row - 1;


      var SpMove = new SpecialRemove(TargetGem.type);
      this.m_GemForceRemoveList.push(SpMove);

      for (let i = ColMin; i <= ColMax; ++i) {
        for (let j = RowMin; j <= RowMax; ++j) {
          let idx = this.GridPosToIdx2(i, j);
          let gem = this.m_Grid[idx].gem;
          if (gem != null && gem.IsCanMove()) {
            SpMove.Enqueue(this.GridPosToIdx2(i, j));
          }
        }
      }
    }
  }

  GemDrop() {
    for (var i = 0; i < this.m_Col; ++i) {
      var EmptyCnt = 0;
      for (var j = this.m_Row - 1; j >= 0; --j) {
        let curIdx = this.GridPosToIdx2(i, j);
        let curGem = this.m_Grid[curIdx].gem;
        if (curGem == null) {
          EmptyCnt++;
        }
        else {
          if (!curGem.IsCanMove())
            EmptyCnt = 0;

          if (EmptyCnt == 0)
            continue;

          let dropIdx = this.GridPosToIdx2(i, (j + EmptyCnt));
          let dropGem = this.m_Grid[dropIdx].gem;
          if (dropGem == null || dropGem.IsCanMove()) {
            this.ChangeGem(i, j, i, j + EmptyCnt);

          }
        }
      }
    }
  }

  ScanMatch() {

    this.m_IsHasMatch = false;
    this.m_MatchRecs.length = 0;

    for (var i = 0; i < this.m_Col; ++i) {
      for (var j = 0; j < this.m_Row; ++j) {
        if (this.CheckMatch(i, j)) {
          this.m_IsHasMatch = true;
        }
      }
    }

    this.ClearGemWithCreateAssign();
  }

  ClearGemWithCreateAssign() {
    
    // 建立格子的索引
    let List = new Dic<number, MatchGrid>();//Dictionary<int, MatchGrid> List = new Dictionary<int, MatchGrid>();
    for (let i = 0; i < this.m_MatchRecs.length; ++i) {
      let Grids = this.m_MatchRecs[i].GetGridPos();
      for (let j = 0; j < Grids.length; ++j) {
        let Idx = this.GridPosToIdx2(Grids[j].x, Grids[j].y);

        let val = List.getVal(Idx).val;
        if (val == null) {
          List.set(Idx, new MatchGrid(Grids[j].x, Grids[j].y));
        }
//else {
        val = List.getVal(Idx).val;
        if(val)
          val.AddMatchRecord(this.m_MatchRecs[i]);
//        }
      }
    }
    // 依照該格的消除次數做排序.
    let List2 : MatchGrid[] = [];// List<MatchGrid> List2 = new List<MatchGrid>();
    //foreach (KeyValuePair<int, MatchGrid> entry in List)
    //for (let i = 0; i < List.length; ++i) {
    List.key.forEach(element => {
      let val = List.getVal(element).val;
      if(val) {
        List2.push(val);
      }
    });
    
    List2.sort(function (a, b) {
      if (b == null) return -1;
      var Compare = a.Recs.length - b.Recs.length;
      if (Compare == 0) {
        if (Math.abs(a.m_v - a.m_h) < Math.abs(b.m_v - b.m_h))
          Compare = 1;
        else
          Compare = 0;
      }
      return -Compare;
    });

    for (var i = 0; i < List2.length; ++i) {
      var entry = List2[i];
      var BaseIdx = this.GridPosToIdx2(entry.m_BasePos.x, entry.m_BasePos.y);

      //if (!(BaseIdx in List)) continue;
      if(!List.isExist(BaseIdx)) continue;

      if (entry.IsMatch3()) {
        // 移除該組合中, 每一格在索引中的MatchGrid.
        var Pos = entry.m_AllGrid;
        for (var i = 0; i < Pos.length; ++i) {
          var Idx = this.GridPosToIdx2(Pos[i].x, Pos[i].y);
          //if (Idx in List) {
          if(List.isExist(Idx)) {
            List.remove(Idx);
            let idx = this.GridPosToIdx(Pos[i]);
            let gem = this.m_Grid[idx].gem;
            if(gem)
            {
              gem.SetCountdown(WAIT_UPDATE_TIME_UNIT, this.OnGemMatchClear);
              if (this.m_CBClear != null) {
                this.m_CBClear(Pos[i].x, Pos[i].y);
              }
            }
          }
        }
        continue;
      }
    }
  }

  CheckMatch(Col : number, Row : number) {
    let idx = this.GridPosToIdx2(Col, Row);
    if (!this.m_Grid[idx].IsCanMove())
      return false;

    var CurrColor = this.GetMatchColor(Col, Row);
    if (CurrColor == -1) return false;


    // DOWN, UP, LEFT, RIGHT, LD, RD, LU, RU
    var CheckPos = [[0, 1], [0, -1], [-1, 0], [1, 0], [-1, 1], [1, 1], [-1, -1], [1, -1],];
    var CheckSameState = [false, false, false, false, false, false, false, false];

    var IsMatch = false;

    // check 8 way.

    for (var i = 0; i < Direction.MAX; ++i) {
      CheckSameState[i] = this.SameColorCheck_(CurrColor, Col, Row, CheckPos[i][0], CheckPos[i][1]);
    }

    // ---
    // ooo
    // ---
    if (CheckSameState[Direction.LEFT] && CheckSameState[Direction.RIGHT]) {
      this.m_MatchRecs.push(new MatchRecord(
        Col + CheckPos[Direction.LEFT][0],
        Row + CheckPos[Direction.LEFT][1],
        Col + CheckPos[Direction.RIGHT][0],
        Row + CheckPos[Direction.RIGHT][1]));
      IsMatch = true;
    }

    // -o-
    // -o-
    // -o-
    if (CheckSameState[Direction.UP] && CheckSameState[Direction.DOWN]) {
      this.m_MatchRecs.push(new MatchRecord(
        Col + CheckPos[Direction.UP][0],
        Row + CheckPos[Direction.UP][1],
        Col + CheckPos[Direction.DOWN][0],
        Row + CheckPos[Direction.DOWN][1]));
      IsMatch = true;
    }

    return IsMatch;
  }

  private SameColorCheck_(TargetColor : number, TargetPosX : number, TargetPosY : number, PosOffsetX : number, PosOffsetY : number) {
    var Col = TargetPosX + PosOffsetX;
    var Row = TargetPosY + PosOffsetY;
    let idx = this.GridPosToIdx2(Col, Row);
    if (Col >= 0 && Col < this.m_Col && Row >= 0 && Row < this.m_Row) {
      if (this.m_Grid[idx].IsCanMove())
        return (TargetColor == this.GetMatchColor(Col, Row));
    }
    return false;
  }

  GetMatchColor(Col : number, Row : number) {
    if (Col < 0 || Col >= this.m_Col) return -1;
    if (Row < 0 || Row >= this.m_Row) return -1;
    let idx = this.GridPosToIdx2(Col, Row);
    let gem = this.m_Grid[idx].gem;
    if (gem === null)
      return -1;
    return gem.color;
  }

  ScanMatchPossible() {
    this.m_PossibleMove.length = 0;
    for (var i = 0; i < this.m_Col; ++i) {
      for (var j = 0; j < this.m_Row; ++j) {
        this.CheckMatchPossible(i, j);
      }
    }

  }

  CheckMatchPossible(Col : number, Row : number) {
    //  上移　　　　左移　     右移      下移
    // ...|...   .......   .......   .......
    // ...|...   ..|....   ....|..   .......
    // .--+--.   ..|....   ....|..   .......
    // ...O...   --+O...   ...O+--   ...O...
    // .......   ..|....   ....|..   .--+--.
    // .......   ..|....   ....|..   ...|...
    // .......   .......   .......   ...|...

    let idx = this.GridPosToIdx2(Col, Row);

    if (!this.m_Grid[idx].IsCanMove())
      return 0;

    var CurrColor = this.GetColor(Col, Row);
    if (CurrColor == -1) return 0;

    var Cnt = 0;

    do {
      // 左移左
      if (CurrColor == this.GetColor(Col - 2, Row) && CurrColor == this.GetColor(Col - 3, Row)) {
        this.m_PossibleMove.push(new MoveRecord(Col, Row, Direction.LEFT));
        break;
      }
      // 左移上
      if (CurrColor == this.GetColor(Col - 1, Row - 1) && CurrColor == this.GetColor(Col - 1, Row - 2)) {
        this.m_PossibleMove.push(new MoveRecord(Col, Row, Direction.LEFT));
        break;
      }
      // 左移下
      if (CurrColor == this.GetColor(Col - 1, Row + 1) && CurrColor == this.GetColor(Col - 1, Row + 2)) {
        this.m_PossibleMove.push(new MoveRecord(Col, Row, Direction.LEFT));
        break;
      }
      // 左移中
      if (CurrColor == this.GetColor(Col - 1, Row + 1) && CurrColor == this.GetColor(Col - 1, Row - 1)) {
        this.m_PossibleMove.push(new MoveRecord(Col, Row, Direction.LEFT));
        break;
      }

      // 左移上方
      if (CurrColor == this.GetColor(Col - 1, Row - 1) && CurrColor == this.GetColor(Col - 2, Row - 1) && CurrColor == this.GetColor(Col - 2, Row)) {
        this.m_PossibleMove.push(new MoveRecord(Col, Row, Direction.LEFT));
        break;
      }

      // 左移下方
      if (CurrColor == this.GetColor(Col - 1, Row + 1) && CurrColor == this.GetColor(Col - 2, Row + 1) && CurrColor == this.GetColor(Col - 2, Row)) {
        this.m_PossibleMove.push(new MoveRecord(Col, Row, Direction.LEFT));
        break;
      }
    } while (false);

    do {
      // 右移右
      if (CurrColor == this.GetColor(Col + 2, Row) && CurrColor == this.GetColor(Col + 3, Row)) {
        this.m_PossibleMove.push(new MoveRecord(Col, Row, Direction.RIGHT));
        break;
      }
      // 右移上
      if (CurrColor == this.GetColor(Col + 1, Row - 1) && CurrColor == this.GetColor(Col + 1, Row - 2)) {
        this.m_PossibleMove.push(new MoveRecord(Col, Row, Direction.RIGHT));
        break;
      }
      // 右移下
      if (CurrColor == this.GetColor(Col + 1, Row + 1) && CurrColor == this.GetColor(Col + 1, Row + 2)) {
        this.m_PossibleMove.push(new MoveRecord(Col, Row, Direction.RIGHT));
        break;
      }
      // 右移中
      if (CurrColor == this.GetColor(Col + 1, Row + 1) && CurrColor == this.GetColor(Col + 1, Row - 1)) {
        this.m_PossibleMove.push(new MoveRecord(Col, Row, Direction.RIGHT));
        break;
      }

      // 右移上方
      if (CurrColor == this.GetColor(Col + 1, Row - 1) && CurrColor == this.GetColor(Col + 2, Row - 1) && CurrColor == this.GetColor(Col + 2, Row)) {
        this.m_PossibleMove.push(new MoveRecord(Col, Row, Direction.RIGHT));
        break;
      }

      // 右移下方
      if (CurrColor == this.GetColor(Col + 1, Row + 1) && CurrColor == this.GetColor(Col + 2, Row + 1) && CurrColor == this.GetColor(Col + 2, Row)) {
        this.m_PossibleMove.push(new MoveRecord(Col, Row, Direction.RIGHT));
        break;
      }
    } while (false);

    do {
      // 上移上
      if (CurrColor == this.GetColor(Col, Row - 2) && CurrColor == this.GetColor(Col, Row - 3)) {
        this.m_PossibleMove.push(new MoveRecord(Col, Row, Direction.UP));
        break;
      }
      // 上移左
      if (CurrColor == this.GetColor(Col - 1, Row - 1) && CurrColor == this.GetColor(Col - 2, Row - 1)) {
        this.m_PossibleMove.push(new MoveRecord(Col, Row, Direction.UP));
        break;
      }
      // 上移右
      if (CurrColor == this.GetColor(Col + 1, Row - 1) && CurrColor == this.GetColor(Col + 2, Row - 1)) {
        this.m_PossibleMove.push(new MoveRecord(Col, Row, Direction.UP));
        break;
      }
      // 上移中
      if (CurrColor == this.GetColor(Col + 1, Row - 1) && CurrColor == this.GetColor(Col - 1, Row - 1)) {
        this.m_PossibleMove.push(new MoveRecord(Col, Row, Direction.UP));
        break;
      }

      // 上移左方
      if (CurrColor == this.GetColor(Col - 1, Row - 1) && CurrColor == this.GetColor(Col - 1, Row - 2) && CurrColor == this.GetColor(Col, Row - 2)) {
        this.m_PossibleMove.push(new MoveRecord(Col, Row, Direction.UP));
        break;
      }
      // 上移右方
      if (CurrColor == this.GetColor(Col + 1, Row - 1) && CurrColor == this.GetColor(Col + 1, Row - 2) && CurrColor == this.GetColor(Col, Row - 2)) {
        this.m_PossibleMove.push(new MoveRecord(Col, Row, Direction.UP));
        break;
      }
    } while (false);

    do {
      // 下移下
      if (CurrColor == this.GetColor(Col, Row + 2) && CurrColor == this.GetColor(Col, Row + 3)) {
        this.m_PossibleMove.push(new MoveRecord(Col, Row, Direction.DOWN));
        break;
      }
      // 下移左
      if (CurrColor == this.GetColor(Col - 1, Row + 1) && CurrColor == this.GetColor(Col - 2, Row + 1)) {
        this.m_PossibleMove.push(new MoveRecord(Col, Row, Direction.DOWN));
        break;
      }
      // 下移右
      if (CurrColor == this.GetColor(Col + 1, Row + 1) && CurrColor == this.GetColor(Col + 2, Row + 1)) {
        this.m_PossibleMove.push(new MoveRecord(Col, Row, Direction.DOWN));
        break;
      }
      // 下移中
      if (CurrColor == this.GetColor(Col + 1, Row + 1) && CurrColor == this.GetColor(Col - 1, Row + 1)) {
        this.m_PossibleMove.push(new MoveRecord(Col, Row, Direction.DOWN));
        break;
      }

      // 下移左方
      if (CurrColor == this.GetColor(Col - 1, Row + 1) && CurrColor == this.GetColor(Col - 1, Row + 2) && CurrColor == this.GetColor(Col, Row + 2)) {
        this.m_PossibleMove.push(new MoveRecord(Col, Row, Direction.DOWN));
        break;
      }
      // 下移右方
      if (CurrColor == this.GetColor(Col + 1, Row + 1) && CurrColor == this.GetColor(Col + 1, Row + 2) && CurrColor == this.GetColor(Col, Row + 2)) {
        this.m_PossibleMove.push(new MoveRecord(Col, Row, Direction.DOWN));
        break;
      }
    } while (false);

    return Cnt;
  }

  updateGem(time_unit : number) {
    // 更新珠子, 清除已消除資料.
    for (var i = 0; i < this.m_Col; ++i) {
      for (var j = 0; j < this.m_Row; ++j) {
        let idx = this.GridPosToIdx2(i, j);
        let gem = this.m_Grid[idx].gem;
        if (gem != null) {
          gem.Update(time_unit);
          if (gem.IsClear())
            this.m_Grid[idx].RemoveGem();
        }
      }
    }
  }

  generate(is_init = false) {
    if (is_init) {
      for (var i = 0; i < this.m_Col; ++i) {
        for (var j = 0; j < this.m_Row; ++j) {
          if (is_init) {
            let idx = this.GridPosToIdx2(i, j);
            this.m_Grid[idx] = new GridState();
            this.m_Grid[idx].GenGem(Math.floor(Math.random() * this.m_ColorCount), new GridPos(i, j));
            
            let gem = this.m_Grid[idx].gem;
            if(gem)
            {
              gem.SetCountdown(WAIT_UPDATE_TIME_UNIT);
              if (this.m_CBGenerate != null) {
                this.m_CBGenerate(i, j, gem.color, gem.type, WAIT_UPDATE_TIME_UNIT2);
              }
            }
          }
        }
      }
      return;
    }

    for (var i = 0; i < this.m_Col; ++i) {
      for (var j = 0; j < this.m_Row; ++j) {
        // 由上往下掃 空格補珠, 如果遇到阻塞就換column.
        let idx = this.GridPosToIdx2(i, j);
        let gem = this.m_Grid[idx].gem;
        if (gem == null) {
          this.m_Grid[idx].GenGem(Math.floor(Math.random() * this.m_ColorCount), new GridPos(i, j));
          gem = this.m_Grid[idx].gem;
          if (gem != null) {
            gem.SetCountdown(WAIT_UPDATE_TIME_UNIT2);
            if (this.m_CBGenerate != null) {
              this.m_CBGenerate(i, j, gem.color, gem.type, WAIT_UPDATE_TIME_UNIT2);
            }
            break;
          }
        }
        else {
          if (!gem.IsCanMove()) {
            break;
          }
        }
      }
    }
  }

  GridPosToIdx(g:GridPos) { return g.x + g.y * this.m_Col; };
  GridPosToIdx2(x:number, y:number) { return x + y * this.m_Col; };
  GridIdxToPos(idx:number) { return { x: idx % this.m_Col, y: idx / this.m_Col } };

  GetColor(Col : number, Row : number) {
    if (Col < 0 || Col >= this.m_Col) return -1;
    if (Row < 0 || Row >= this.m_Row) return -1;
    let idx = this.GridPosToIdx2(Col, Row);
    let gem = this.m_Grid[idx].gem;
    if (gem == null)
      return -1;
    return gem.color;
  }

  swipe(Col : number, Row : number, Dir : Direction) {
    var CurrColor = this.GetColor(Col, Row);
    var Target = new GridPos(Col, Row);

    switch (Dir) {
      case Direction.DOWN:
        Target.y++; break;
      case Direction.UP:
        Target.y--; break;
      case Direction.LEFT:
        Target.x--; break;
      case Direction.RIGHT:
        Target.x++; break;
    }

    if (Target.x < 0) return false;
    if (Target.x >= this.m_Col) return false;
    if (Target.y < 0) return false;
    if (Target.y >= this.m_Row) return false;

    if (!this.m_Grid[this.GridPosToIdx2(Col, Row)].IsCanMove()) return false;
    if (!this.m_Grid[this.GridPosToIdx(Target)].IsCanMove()) return false;

    this.m_SwipeRecs.push(new SwipeRecord(new GridPos(Col, Row), Target, SwipeRecordState.START));

    return true;
  }

  UpdateSwipe() {
    // 執行swipe行為.
    for (var i = 0; i < this.m_SwipeRecs.length; ++i) {
      var Rec = this.m_SwipeRecs[i];
      let idx = this.GridPosToIdx(Rec.m_Pos1);
      var Grid1 = this.m_Grid[idx];
      var Grid2 = this.m_Grid[idx];
      if (Grid1.gem === null
        || !Grid1.gem.IsCanMove())
        continue;
      if (Grid2.gem === null
        || !Grid2.gem.IsCanMove())
        continue;

      if (!Rec.IsEnd()) {
        this.SwipeChangeGem(Rec.m_Pos1, Rec.m_Pos2);
        Rec.SetChanged();
      }
    }
    //m_SwipeRecs.RemoveAll( (SwipeRecord Rec) => { return Rec.IsEnd(); });

    if (this.m_SwipeRecs.length < 1) return;

    for (var i = this.m_SwipeRecs.length - 1; i--;) {
      var Rec = this.m_SwipeRecs[i];
      if (Rec.IsEnd())
        this.m_SwipeRecs.splice(i, 1);
    }
  }

  SwipeChangeGem(Pos1 : GridPos, Pos2 : GridPos) {
    var IsCanMatch = false;
    for (var i = 0; i < this.m_PossibleMove.length; ++i) {
      var PossibleMove = this.m_PossibleMove[i];
      if (PossibleMove.IsEqual(Pos1.x, Pos1.y, this.GetDirection(Pos1.x, Pos1.y, Pos2.x, Pos2.y))) {
        IsCanMatch = true;
        break;
      }

      if (PossibleMove.IsEqual(Pos2.x, Pos2.y, this.GetDirection(Pos2.x, Pos2.y, Pos1.x, Pos1.y))) {
        IsCanMatch = true;
        break;
      }
    }

    this.ChangeGem(Pos1.x, Pos1.y, Pos2.x, Pos2.y, IsCanMatch);
  }

  GetDirection(Fromx1 : number, Fromy1 : number, Tox2 : number, Toy2 : number) {
    if (Fromx1 > Tox2)
      return Direction.LEFT;
    else if (Fromx1 < Tox2)
      return Direction.RIGHT;
    else {
      if (Fromy1 > Toy2)
        return Direction.UP;
      else
        return Direction.DOWN;
    }
  }

  ChangeGem(x1 : number, y1 : number, x2 : number, y2 : number, oneWay = true) {
    let idx1 = this.GridPosToIdx2(x1, y1);
    let idx2 = this.GridPosToIdx2(x2, y2);

    var Grid1 = this.m_Grid[idx1];
    var Grid2 = this.m_Grid[idx2];

    var Tmp = Grid1.gem;
    Grid1.gem = Grid2.gem;
    Grid2.gem = Tmp;

    if (Grid1.gem != null) {
      Grid1.gem.m_TempPos.x = x1;
      Grid1.gem.m_TempPos.y = y1;
    }
    if (Grid2.gem != null) {
      Grid2.gem.m_TempPos.x = x2;
      Grid2.gem.m_TempPos.y = y2;
    }

    if(this.m_CBMove)
      this.m_CBMove(x1, y1, x2, y2, 1);

    let gem1 = this.m_Grid[idx1].gem;
    if (gem1 != null)
      gem1.SetCountdown(WAIT_UPDATE_TIME_UNIT2);

    let gem2 = this.m_Grid[idx2].gem ;  
    if (gem2 != null)
      gem2.SetCountdown(WAIT_UPDATE_TIME_UNIT2);
    

  }
}

}