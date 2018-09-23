'use strict';

class GridPos {
  constructor(vx, vy) {
    this.x = vx;
    this.y = vy;
  }
}

class MatchRecord {
  constructor(x1, y1, x2, y2) {
    this.m_x1 = x1;
    this.m_y1 = y1;
    this.m_x2 = x2;
    this.m_y2 = y2;
  }

  IsInside(x, y) {
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
    var List = [];

    for (var i = this.m_x1; i <= this.m_x2; ++i) {
      for (var j = this.m_y1; j <= this.m_y2; ++j) {
        List.push(new GridPos(i, j));
      }
    }
    return List;
  }
}

class MatchGrid {
  constructor(x, y) {
    this.m_BasePos = new GridPos(x, y);
    this.Recs = [];
    this.m_AllGrid = [];
    this.m_v = 0;
    this.m_h = 0;
    this.m_s = 0;
  }


  AddMatchRecord(Rec) // MatchRecord
  {
    this.Recs.push(Rec);
    if (Rec.IsVertical())
      this.m_v++;
    else if (Rec.IsHorizontal())
      this.m_h++;
    else if (Rec.IsSquare())
      this.m_s++;

    var PosList = Rec.GetGridPos();
    for (var i = 0; i < PosList.length; ++i) {
      if (!this.m_AllGrid.includes(PosList[i])) {
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
  constructor(style)
  {
    this.m_Style = Style;
    this.m_PosList = [];
  }

  Enqueue(Idx) {
    this.m_PosList.push(Idx);
  }
  
  EnqueueList(Idxs) {
    for (var i = 0; i < Idxs.length; ++i) {
      this.m_PosList.push(Idxs[i]);
    }
  }
  
  Dequeue(Idx) {
    var rtn = {}
    if (this.m_PosList.length == 0)
      rtn['result'] = false;
    rtn['val'] = this.m_PosList[0];
    this.splice(0, 1);
    rtn['result'] = true;
  
    return rtn;
  }
}

class MoveRecord{
  constructor(x1, x2, direction)
  {
    this.m_x1 = x1;
    this.m_x2 = x2;
    this.m_direction = direction;
  }

  IsEqual(x, y, dir) {
    return x == this.m_x1 && y == this.m_y1 && this.m_direction == dir;
  }
}

class SwipeRecord
{
  

  constructor(Pos1, Pos2, s)
  {
    this.m_Pos1 = Pos1;
    this.m_Pos2 = Pos2;
    this.m_State = s;
  }
  
  Pos1() { return this.m_Pos1; }
  Pos2() { return this.m_Pos2; }
  
  SetChanged() {
    this.m_State = SwipeRecord.State.END;
  }
  
  IsStart() {
    return this.m_State == SwipeRecord.State.START;
  }
  
  IsEnd() {
    return this.m_State == SwipeRecord.State.END;
  }
}
// static
SwipeRecord.State = {
  START: 0,
  REVERT: 1,
  END: 2
}

class Gem{
  Init(Color, Pos) {
    this.m_Color = Color;
    this.m_TempPos = Pos;
    this.m_Type = Gem.GemType.Normal;
    this.m_State = Gem.State.Idle;
    this.m_Callback = null;
    this.m_Countdown = 0;
  };
  
  InitByState(State, Pos) {
    this.m_Color = State.GemColor;
    this.m_TempPos = Pos;
    this.m_Type = Gem.State.GemType;
    this.m_State = Gem.State.Idle;
    this.m_Callback = null;
    this.m_Countdown = 0;
  }
  
  IsCanMove() {
    return this.m_State == Gem.State.Idle;
  }
  
  Update(DeltaTime) {
    this.m_Countdown -= DeltaTime;
    if (this.m_Countdown <= 0) {
      this.m_State = Gem.State.Idle;
      if (this.m_Callback != null)
        this.m_Callback(this);
  
    }
  }
  
  SetCountdown(Cnt, Callback = null) {
    this.m_Countdown = Cnt;
    this.m_State = Gem.State.Moving;
    this.m_Callback = Callback;
  }
  
  SetClear() {
    this.m_State = Gem.State.Clear;
  }
  
  IsClear() {
    return this.m_State == Gem.State.Clear;
  }
}
// static 
Gem.State = { Idle: 1, Moving: 2, Clear: 3, };
Object.freeze(Gem.State);

Gem.GemType = { Normal: 0, LineColumn: 1, LineRow: 2, Bomb: 3, Wildcard: 4, Cross: 5 };
Object.freeze(Gem.GemType);

class GridState{
  constructor()
  {
    this.m_Gem = null;
  }

  GenGem(Color, Pos) {
    if (this.m_Gem == null) {
      //this.m_Gem = new Gem(Color, Pos);
      this.m_Gem = new Gem();
      this.m_Gem.Init(Color, Pos);
    }
  };
  
  GenGemByInfo(GemInfo, Pos) {
    if (this.m_Gem == null) {
      //this.m_Gem = new Gem(GemInfo, Pos);
      this.m_Gem = new Gem();
      this.m_Gem.Init(GemInfo, Pos);
    }
  }
  
  IsCanMove() {
    if (this.m_Gem == null) return false;
    return this.m_Gem.IsCanMove();
  }
  
  Clear() {
    this.m_Gem.SetClear();
  }
}


var match3 = match3 || {
  m_CBGenerate: null,
  m_CBClear: null,
  m_CBMove: null,
  m_CBLock: null,
  m_CBLog: null,
  m_CBLog2: null,

  m_SwipeRecs: [],
  m_Grid: [],
  m_PossibleMove: [],
  m_MatchRecs: [],
  m_GemForceRemoveList: [],
  m_IsHasMatch: false,

  Direction: {
    DOWN: 0,
    UP: 1,
    LEFT: 2,
    RIGHT: 3,
    LD: 4,
    RD: 5,
    LU: 6,
    RU: 7,
    MAX: 8
  },


  WAIT_UPDATE_TIME_UNIT: 500,
  WAIT_UPDATE_TIME_UNIT2: 300,
  WAIT_CLEAR_TIME_UNIT: 300,

  init: function (col_cnt, row_cnt, color_cnt) {

    this.m_Grid = [];
    this.m_Row = row_cnt;
    this.m_Col = col_cnt;
    this.m_ColorCount = color_cnt;
  },

  update: function (time_unit) {

    this.UpdateSwipe();
    this.updateGem(time_unit);

    this.ScanMatch();

    this.SpecialRemoveGem();
    this.GemDrop();
    this.generate(false);
    this.ScanMatchPossible();

  },


  SpecialRemoveGem: function () {
    for (var i = 0; i < this.m_GemForceRemoveList.length; ++i) {
      var SpRemove = this.m_GemForceRemoveList[i];

      var PosIdx = 0, x = 0, y = 0;
      //while (SpRemove.Dequeue(ref PosIdx))
      while (true) {
        var rtn = SpRemove.Dequeue();
        if (rtn['result'] == false) break;

        var p = GridIdxToPos(rtn['val']);
        x = p.x;
        y = p.y;
        var idx = rtn['val']
        if (this.m_Grid[idx].m_Gem == null || !this.m_Grid[idx].m_Gem.IsCanMove())
          continue;
        this.m_Grid[idx].m_Gem.SetCountdown(this.WAIT_UPDATE_TIME_UNIT, this.OnGemMatchClear);
        if (this.m_CBClear != null) {
          this.m_CBClear(x, y);
        }
      }
    }

    this.m_GemForceRemoveList.length = 0;
  },

  OnGemMatchClear: function (TargetGem) // Gem
  {
    TargetGem.SetClear();

    if (TargetGem.m_Type == Gem.GemType.LineColumn) {
      // test
      var SpMove = new SpecialRemove(TargetGem.m_Type);
      m_GemForceRemoveList.push(SpMove);
      for (var i = 0; i < this.m_Row; ++i) {
        let idx = GridPosToIdx2(TargetGem.m_TempPos.x, i);
        if (this.m_Grid[idx].m_Gem != null && this.m_Grid[idx].m_Gem.IsCanMove()) {
          SpMove.Enqueue(GridPosToIdx2(TargetGem.m_TempPos.x, i));
        }
      }

    }
    if (TargetGem.m_Type == Gem.GemType.LineRow) {
      var SpMove = new SpecialRemove(TargetGem.m_Type);
      m_GemForceRemoveList.push(SpMove);

      for (var i = 0; i < this.m_Col; ++i) {
        let idx = GridPosToIdx2(i, TargetGem.m_TempPos.y);
        if (this.m_Grid[idx].m_Gem != null && this.m_Grid[idx].m_Gem.IsCanMove()) {
          SpMove.Enqueue(GridPosToIdx(i, TargetGem.m_TempPos.y));
        }
      }
    }


    if (TargetGem.m_Type == Gem.GemType.Bomb) {
      var ColMin = TargetGem.m_TempPos.x - 1;
      if (ColMin < 0) ColMin = 0;
      var ColMax = TargetGem.m_TempPos.x + 1;
      if (ColMax >= m_Col) ColMax = m_Col - 1;
      var RowMin = TargetGem.m_TempPos.y - 1;
      if (RowMin < 0) RowMin = 0;
      var RowMax = TargetGem.m_TempPos.y + 1;
      if (RowMax >= m_Row) RowMax = m_Row - 1;


      var SpMove = new SpecialRemove(TargetGem.m_Type);
      m_GemForceRemoveList.Add(SpMove);

      for (var i = ColMin; i <= ColMax; ++i) {
        for (var j = RowMin; j <= RowMax; ++j) {
          let idx = GridPosToIdx2(i, j);
          if (this.m_Grid[idx].m_Gem != null && this.m_Grid[idx].m_Gem.IsCanMove()) {
            SpMove.Enqueue(GridPosToIdx(i, j));
          }
        }
      }
    }
  },

  GemDrop: function () {
    for (var i = 0; i < this.m_Col; ++i) {
      var EmptyCnt = 0;
      for (var j = this.m_Row - 1; j >= 0; --j) {
        let curIdx = this.GridPosToIdx2(i, j);
        if (this.m_Grid[curIdx].m_Gem == null) {
          EmptyCnt++;
        }
        else {
          if (!this.m_Grid[curIdx].m_Gem.IsCanMove())
            EmptyCnt = 0;

          if (EmptyCnt == 0)
            continue;

          let dropIdx = this.GridPosToIdx2(i, (j + EmptyCnt));
          if (this.m_Grid[dropIdx].m_Gem == null ||
            this.m_Grid[dropIdx].m_Gem.IsCanMove()) {
            this.ChangeGem(i, j, i, j + EmptyCnt);

          }
        }
      }
    }
  },

  ScanMatch: function () {

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
  },

  ClearGemWithCreateAssign: function () {
    // 建立格子的索引
    var List = {};//Dictionary<int, MatchGrid> List = new Dictionary<int, MatchGrid>();
    for (var i = 0; i < this.m_MatchRecs.length; ++i) {
      var Grids = this.m_MatchRecs[i].GetGridPos();
      for (var j = 0; j < Grids.length; ++j) {
        var Idx = this.GridPosToIdx2(Grids[j].x, Grids[j].y);

        if (!(Idx in List)) {
          List[Idx] = new MatchGrid(Grids[j].x, Grids[j].y);
        }
        List[Idx].AddMatchRecord(this.m_MatchRecs[i]);
      }
    }
    // 依照該格的消除次數做排序.
    var List2 = [];// List<MatchGrid> List2 = new List<MatchGrid>();
    //foreach (KeyValuePair<int, MatchGrid> entry in List)
    for (const [key, value] of Object.entries(List)) {
      List2.push(value);
    }
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

      if (!(BaseIdx in List)) continue;

      if (entry.IsMatch3()) {
        // 移除該組合中, 每一格在索引中的MatchGrid.
        var Pos = entry.m_AllGrid;
        for (var i = 0; i < Pos.length; ++i) {
          var Idx = this.GridPosToIdx2(Pos[i].x, Pos[i].y);
          if (Idx in List) {
            delete List[Idx];
            let idx = this.GridPosToIdx(Pos[i]);
            this.m_Grid[idx].m_Gem.SetCountdown(this.WAIT_UPDATE_TIME_UNIT, this.OnGemMatchClear);
            if (this.m_CBClear != null) {
              this.m_CBClear(Pos[i].x, Pos[i].y);
            }
          }
        }
        continue;
      }
    }
  },

  CheckMatch: function (Col, Row) {
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

    for (var i = 0; i < match3.Direction.MAX; ++i) {
      CheckSameState[i] = this.SameColorCheck_(CurrColor, Col, Row, CheckPos[i][0], CheckPos[i][1]);
    }

    // ---
    // ooo
    // ---
    if (CheckSameState[this.Direction.LEFT] && CheckSameState[this.Direction.RIGHT]) {
      this.m_MatchRecs.push(new MatchRecord(
        Col + CheckPos[this.Direction.LEFT][0],
        Row + CheckPos[this.Direction.LEFT][1],
        Col + CheckPos[this.Direction.RIGHT][0],
        Row + CheckPos[this.Direction.RIGHT][1]));
      IsMatch = true;
    }

    // -o-
    // -o-
    // -o-
    if (CheckSameState[this.Direction.UP] && CheckSameState[this.Direction.DOWN]) {
      this.m_MatchRecs.push(new MatchRecord(
        Col + CheckPos[this.Direction.UP][0],
        Row + CheckPos[this.Direction.UP][1],
        Col + CheckPos[this.Direction.DOWN][0],
        Row + CheckPos[this.Direction.DOWN][1]));
      IsMatch = true;
    }

    return IsMatch;
  },

  SameColorCheck_: function (TargetColor, TargetPosX, TargetPosY, PosOffsetX, PosOffsetY) {
    var Col = TargetPosX + PosOffsetX;
    var Row = TargetPosY + PosOffsetY;
    let idx = this.GridPosToIdx2(Col, Row);
    if (Col >= 0 && Col < this.m_Col && Row >= 0 && Row < this.m_Row) {
      if (this.m_Grid[idx].IsCanMove())
        return (TargetColor == this.GetMatchColor(Col, Row));
    }
    return false;
  },

  GetMatchColor: function (Col, Row) {
    if (Col < 0 || Col >= this.m_Col) return -1;
    if (Row < 0 || Row >= this.m_Row) return -1;
    let idx = this.GridPosToIdx2(Col, Row);
    if (this.m_Grid[idx].m_Gem === null)
      return -1;
    return this.m_Grid[idx].m_Gem.m_Color;
  },

  ScanMatchPossible: function () {
    this.m_PossibleMove.length = 0;
    for (var i = 0; i < this.m_Col; ++i) {
      for (var j = 0; j < this.m_Row; ++j) {
        this.CheckMatchPossible(i, j);
      }
    }

  },

  CheckMatchPossible: function (Col, Row) {
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
        this.m_PossibleMove.push(new MoveRecord(Col, Row, match3.Direction.LEFT));
        break;
      }
      // 左移上
      if (CurrColor == this.GetColor(Col - 1, Row - 1) && CurrColor == this.GetColor(Col - 1, Row - 2)) {
        this.m_PossibleMove.push(new MoveRecord(Col, Row, match3.Direction.LEFT));
        break;
      }
      // 左移下
      if (CurrColor == this.GetColor(Col - 1, Row + 1) && CurrColor == this.GetColor(Col - 1, Row + 2)) {
        this.m_PossibleMove.push(new MoveRecord(Col, Row, match3.Direction.LEFT));
        break;
      }
      // 左移中
      if (CurrColor == this.GetColor(Col - 1, Row + 1) && CurrColor == this.GetColor(Col - 1, Row - 1)) {
        this.m_PossibleMove.push(new MoveRecord(Col, Row, match3.Direction.LEFT));
        break;
      }

      // 左移上方
      if (CurrColor == this.GetColor(Col - 1, Row - 1) && CurrColor == this.GetColor(Col - 2, Row - 1) && CurrColor == this.GetColor(Col - 2, Row)) {
        this.m_PossibleMove.push(new MoveRecord(Col, Row, match3.Direction.LEFT));
        break;
      }

      // 左移下方
      if (CurrColor == this.GetColor(Col - 1, Row + 1) && CurrColor == this.GetColor(Col - 2, Row + 1) && CurrColor == this.GetColor(Col - 2, Row)) {
        this.m_PossibleMove.push(new MoveRecord(Col, Row, match3.Direction.LEFT));
        break;
      }
    } while (false);

    do {
      // 右移右
      if (CurrColor == this.GetColor(Col + 2, Row) && CurrColor == this.GetColor(Col + 3, Row)) {
        this.m_PossibleMove.push(new MoveRecord(Col, Row, match3.Direction.RIGHT));
        break;
      }
      // 右移上
      if (CurrColor == this.GetColor(Col + 1, Row - 1) && CurrColor == this.GetColor(Col + 1, Row - 2)) {
        this.m_PossibleMove.push(new MoveRecord(Col, Row, match3.Direction.RIGHT));
        break;
      }
      // 右移下
      if (CurrColor == this.GetColor(Col + 1, Row + 1) && CurrColor == this.GetColor(Col + 1, Row + 2)) {
        this.m_PossibleMove.push(new MoveRecord(Col, Row, match3.Direction.RIGHT));
        break;
      }
      // 右移中
      if (CurrColor == this.GetColor(Col + 1, Row + 1) && CurrColor == this.GetColor(Col + 1, Row - 1)) {
        this.m_PossibleMove.push(new MoveRecord(Col, Row, match3.Direction.RIGHT));
        break;
      }

      // 右移上方
      if (CurrColor == this.GetColor(Col + 1, Row - 1) && CurrColor == this.GetColor(Col + 2, Row - 1) && CurrColor == this.GetColor(Col + 2, Row)) {
        this.m_PossibleMove.push(new MoveRecord(Col, Row, match3.Direction.RIGHT));
        break;
      }

      // 右移下方
      if (CurrColor == this.GetColor(Col + 1, Row + 1) && CurrColor == this.GetColor(Col + 2, Row + 1) && CurrColor == this.GetColor(Col + 2, Row)) {
        this.m_PossibleMove.push(new MoveRecord(Col, Row, match3.Direction.RIGHT));
        break;
      }
    } while (false);

    do {
      // 上移上
      if (CurrColor == this.GetColor(Col, Row - 2) && CurrColor == this.GetColor(Col, Row - 3)) {
        this.m_PossibleMove.push(new MoveRecord(Col, Row, match3.Direction.UP));
        break;
      }
      // 上移左
      if (CurrColor == this.GetColor(Col - 1, Row - 1) && CurrColor == this.GetColor(Col - 2, Row - 1)) {
        this.m_PossibleMove.push(new MoveRecord(Col, Row, match3.Direction.UP));
        break;
      }
      // 上移右
      if (CurrColor == this.GetColor(Col + 1, Row - 1) && CurrColor == this.GetColor(Col + 2, Row - 1)) {
        this.m_PossibleMove.push(new MoveRecord(Col, Row, match3.Direction.UP));
        break;
      }
      // 上移中
      if (CurrColor == this.GetColor(Col + 1, Row - 1) && CurrColor == this.GetColor(Col - 1, Row - 1)) {
        this.m_PossibleMove.push(new MoveRecord(Col, Row, match3.Direction.UP));
        break;
      }

      // 上移左方
      if (CurrColor == this.GetColor(Col - 1, Row - 1) && CurrColor == this.GetColor(Col - 1, Row - 2) && CurrColor == this.GetColor(Col, Row - 2)) {
        this.m_PossibleMove.push(new MoveRecord(Col, Row, match3.Direction.UP));
        break;
      }
      // 上移右方
      if (CurrColor == this.GetColor(Col + 1, Row - 1) && CurrColor == this.GetColor(Col + 1, Row - 2) && CurrColor == this.GetColor(Col, Row - 2)) {
        this.m_PossibleMove.push(new MoveRecord(Col, Row, match3.Direction.UP));
        break;
      }
    } while (false);

    do {
      // 下移下
      if (CurrColor == this.GetColor(Col, Row + 2) && CurrColor == this.GetColor(Col, Row + 3)) {
        this.m_PossibleMove.push(new MoveRecord(Col, Row, match3.Direction.DOWN));
        break;
      }
      // 下移左
      if (CurrColor == this.GetColor(Col - 1, Row + 1) && CurrColor == this.GetColor(Col - 2, Row + 1)) {
        this.m_PossibleMove.push(new MoveRecord(Col, Row, match3.Direction.DOWN));
        break;
      }
      // 下移右
      if (CurrColor == this.GetColor(Col + 1, Row + 1) && CurrColor == this.GetColor(Col + 2, Row + 1)) {
        this.m_PossibleMove.push(new MoveRecord(Col, Row, match3.Direction.DOWN));
        break;
      }
      // 下移中
      if (CurrColor == this.GetColor(Col + 1, Row + 1) && CurrColor == this.GetColor(Col - 1, Row + 1)) {
        this.m_PossibleMove.push(new MoveRecord(Col, Row, match3.Direction.DOWN));
        break;
      }

      // 下移左方
      if (CurrColor == this.GetColor(Col - 1, Row + 1) && CurrColor == this.GetColor(Col - 1, Row + 2) && CurrColor == this.GetColor(Col, Row + 2)) {
        this.m_PossibleMove.push(new MoveRecord(Col, Row, match3.Direction.DOWN));
        break;
      }
      // 下移右方
      if (CurrColor == this.GetColor(Col + 1, Row + 1) && CurrColor == this.GetColor(Col + 1, Row + 2) && CurrColor == this.GetColor(Col, Row + 2)) {
        this.m_PossibleMove.push(new MoveRecord(Col, Row, match3.Direction.DOWN));
        break;
      }
    } while (false);

    return Cnt;
  },

  updateGem: function (time_unit) {
    // 更新珠子, 清除已消除資料.
    for (var i = 0; i < this.m_Col; ++i) {
      for (var j = 0; j < this.m_Row; ++j) {
        let idx = this.GridPosToIdx2(i, j);
        if (this.m_Grid[idx].m_Gem != null) {
          this.m_Grid[idx].m_Gem.Update(time_unit);
          if (this.m_Grid[idx].m_Gem.IsClear())
            this.m_Grid[idx].m_Gem = null;
        }
      }
    }
  },

  generate: function (is_init = false) {
    if (is_init) {
      for (var i = 0; i < this.m_Col; ++i) {
        for (var j = 0; j < this.m_Row; ++j) {
          if (is_init) {
            let idx = this.GridPosToIdx2(i, j);
            this.m_Grid[idx] = new GridState();
            this.m_Grid[idx].GenGem(Math.floor(Math.random() * this.m_ColorCount), new GridPos(i, j));
            this.m_Grid[idx].m_Gem.SetCountdown(this.WAIT_UPDATE_TIME_UNIT);
            if (this.m_CBGenerate != null) {
              this.m_CBGenerate(i, j, this.m_Grid[idx].m_Gem.m_Color, this.m_Grid[idx].m_Gem.m_Type, this.WAIT_UPDATE_TIME_UNIT2);
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
        if (this.m_Grid[idx].m_Gem == null) {
          this.m_Grid[idx].GenGem(Math.floor(Math.random() * this.m_ColorCount), new GridPos(i, j));
          this.m_Grid[idx].m_Gem.SetCountdown(this.WAIT_UPDATE_TIME_UNIT2);
          if (this.m_CBGenerate != null) {
            this.m_CBGenerate(i, j, this.m_Grid[idx].m_Gem.m_Color, this.m_Grid[idx].m_Gem.m_Type, this.WAIT_UPDATE_TIME_UNIT2);
          }
          break;
        }
        else {
          if (!this.m_Grid[idx].m_Gem.IsCanMove()) {
            break;
          }
        }
      }
    }
  },

  GridPosToIdx: function (g) { return g.x + g.y * this.m_Col; },
  GridPosToIdx2: function (x, y) { return x + y * this.m_Col; },
  GridIdxToPos: function (idx) { return { x: idx % m_Col, y: idx / m_Col } },

  GetColor: function (Col, Row) {
    if (Col < 0 || Col >= this.m_Col) return -1;
    if (Row < 0 || Row >= this.m_Row) return -1;
    let idx = this.GridPosToIdx2(Col, Row);
    if (this.m_Grid[idx].m_Gem === null)
      return -1;
    return this.m_Grid[idx].m_Gem.Color;
  },

  swipe: function (Col, Row, Dir) {
    var CurrColor = this.GetColor(Col, Row);
    var Target = new GridPos(Col, Row);

    switch (Dir) {
      case this.Direction.DOWN:
        Target.y++; break;
      case this.Direction.UP:
        Target.y--; break;
      case this.Direction.LEFT:
        Target.x--; break;
      case this.Direction.RIGHT:
        Target.x++; break;
    }

    if (Target.x < 0) return false;
    if (Target.x >= this.m_Col) return false;
    if (Target.y < 0) return false;
    if (Target.y >= this.m_Row) return false;

    if (!this.m_Grid[this.GridPosToIdx2(Col, Row)].IsCanMove()) return false;
    if (!this.m_Grid[this.GridPosToIdx(Target)].IsCanMove()) return false;

    this.m_SwipeRecs.push(new SwipeRecord(new GridPos(Col, Row), Target, SwipeRecord.State.START));

    return true;
  },

  UpdateSwipe: function () {
    // 執行swipe行為.
    for (var i = 0; i < this.m_SwipeRecs.length; ++i) {
      var Rec = this.m_SwipeRecs[i];
      let idx = this.GridPosToIdx(Rec.m_Pos1);
      var Grid1 = this.m_Grid[idx];
      var Grid2 = this.m_Grid[idx];
      if (Grid1.m_Gem === null
        || !Grid1.m_Gem.IsCanMove())
        continue;
      if (Grid2.m_Gem === null
        || !Grid2.m_Gem.IsCanMove())
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
  },

  SwipeChangeGem: function (Pos1, Pos2) {
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
  },

  GetDirection: function (Fromx1, Fromy1, Tox2, Toy2) {
    if (Fromx1 > Tox2)
      return this.Direction.LEFT;
    else if (Fromx1 < Tox2)
      return this.Direction.RIGHT;
    else {
      if (Fromy1 > Toy2)
        return this.Direction.UP;
      else
        return this.Direction.DOWN;
    }
  },

  ChangeGem: function (x1, y1, x2, y2, oneWay = true) {
    let idx1 = this.GridPosToIdx2(x1, y1);
    let idx2 = this.GridPosToIdx2(x2, y2);

    var Grid1 = this.m_Grid[idx1];
    var Grid2 = this.m_Grid[idx2];

    if (true) {
      var Tmp = Grid1.m_Gem;
      Grid1.m_Gem = Grid2.m_Gem;
      Grid2.m_Gem = Tmp;

      if (Grid1.m_Gem != null) {
        Grid1.m_Gem.m_TempPos.x = x1;
        Grid1.m_Gem.m_TempPos.y = y1;
      }
      if (Grid2.m_Gem != null) {
        Grid2.m_Gem.m_TempPos.x = x2;
        Grid2.m_Gem.m_TempPos.y = y2;
      }

      this.m_CBMove(x1, y1, x2, y2, 1);

      if (this.m_Grid[idx1].m_Gem != null)
        this.m_Grid[idx1].m_Gem.SetCountdown(this.WAIT_UPDATE_TIME_UNIT2);
      if (this.m_Grid[idx2].m_Gem != null)
        this.m_Grid[idx2].m_Gem.SetCountdown(this.WAIT_UPDATE_TIME_UNIT2);
    }
    else {
      this.m_CBMove(x1, y1, x2, y2, 2);

      if (this.m_Grid[idx1].m_Gem != null)
        this.m_Grid[idx1].m_Gem.SetCountdown(this.WAIT_UPDATE_TIME_UNIT * 2);
      if (this.m_Grid[idx2].m_Gem != null)
        this.m_Grid[idx2].m_Gem.SetCountdown(this.WAIT_UPDATE_TIME_UNIT * 2);
    }

  }
};