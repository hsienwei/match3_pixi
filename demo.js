'use strict';

var WAIT_UPDATE_TIME_UNIT = 500;
var WAIT_UPDATE_TIME_UNIT2 = 300;
var WAIT_CLEAR_TIME_UNIT = 300;


var GridPos = function (vx, vy) {
	this.x = vx;
	this.y = vy;
};

//--------

var MatchRecord = function (x1, y1, x2, y2)
{
	this.m_x1 = x1;
	this.m_y1 = y1;
	this.m_x2 = x2;
	this.m_y2 = y2;
}

MatchRecord.prototype.IsInside = function (x, y) {
	return x >= this.m_x1 && x <= this.m_x2 && y >= this.m_y1 && y <= this.m_y2;
}

MatchRecord.prototype.IsVertical = function () {
	return this.m_y1 == this.m_y2;
}

MatchRecord.prototype.IsHorizontal = function () {
	return this.m_x1 == this.m_x2;
}

MatchRecord.prototype.IsSquare = function () {
	return (Math.abs(this.m_x1 - this.m_x2) == 1) && (Math.abs(this.m_y1 - this.m_y2) == 1);
}

MatchRecord.prototype.GetGridPos = function () {
	var List = [];//List<GridPos> List = new List<GridPos>();

	for (var i = this.m_x1; i <= this.m_x2; ++i) {
		for (var j = this.m_y1; j <= this.m_y2; ++j) {
			List.push(new GridPos(i, j));
		}
	}
	return List;
}
	




//--------
var MatchGrid = function (x, y) {
	this.m_BasePos = new GridPos(x, y);
	this.Recs = [];  // List<MatchRecord> Recs;
	this.m_AllGrid = [];  // List<GridPos> m_AllGrid;

	this.m_v = 0;
	this.m_h = 0;
	this.m_s = 0;
};

//----
var SpecialRemove  = function (Style)
{
	this.m_Style = Style;
	this.m_PosList = []; //  new Queue<int>();
};

SpecialRemove.prototype.Enqueue = function(Idx) {
	this.m_PosList.push(Idx);
}

SpecialRemove.prototype.EnqueueList = function(Idxs) {
	//m_PosList.Enqueue(Idx);
	for (var i = 0; i < Idxs.length; ++i)
	{
		this.m_PosList.push(Idxs[i]);
	}
}


SpecialRemove.prototype.Dequeue = function(Idx)
  {
	var rtn = {}
	if (this.m_PosList.length == 0) 
		rtn['result'] = false;
	rtn['val'] = this.m_PosList[0];
	this.splice(0, 1);
	rtn['result'] = true;

	return rtn;
  }

//-----

MatchGrid.prototype.AddMatchRecord = function (Rec) // MatchRecord
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

MatchGrid.prototype.BasePos = function () { return this.m_BasePos; }
MatchGrid.prototype.AllPos = function() {  return  this.m_AllGrid; } 

MatchGrid.prototype.IsMatch5 = function () {
	return this.m_v == 3 || this.m_h == 3;
}

MatchGrid.prototype.IsMatchT = function () {
	return this.m_v >= 1 && this.m_h >= 1;
}

MatchGrid.prototype.IsMatch4 = function () {
	return this.m_v >= 2 || this.m_h >= 2;
}

MatchGrid.prototype.IsMatchS = function () {
	return this.m_s == 4;
}

MatchGrid.prototype.IsMatch3 = function () {
	return this.m_v >= 1 || this.m_h >= 1;
}

// -------
var MoveRecord = function (x1, x2, Direction)
{
	this.m_x1 = x1;
	this.m_x2 = x2;
	this.m_Direction = Direction;
}

MoveRecord.prototype.IsEqual = function(x, y, Dir) { 
	return x == this.m_x1 && y == this.m_y1 && this.m_Direction == Dir;
}

var SwipeRecord = function(Pos1, Pos2, s )
{
	  this.m_Pos1 = Pos1;
	  this.m_Pos2 = Pos2;
	  this.m_State = s;
};

SwipeRecord.prototype.State = {
	START : 0,
	REVERT : 1,
	END : 2
  };

SwipeRecord.prototype.Pos1 = function() { return this.m_Pos1; }
SwipeRecord.prototype.Pos2 = function() { return this.m_Pos2; } 

SwipeRecord.prototype.SetChanged = function()
{
	this.m_State = this.State.END;
}

SwipeRecord.prototype.IsStart = function()
{
  return this.m_State == this.State.START;
}


SwipeRecord.prototype.IsEnd = function()
{
  return this.m_State == this.State.END;
}


//#region Gem
var Gem = function () {};

Gem.prototype.State = {Idle:1, Moving:2, Clear:3, };
Object.freeze(Gem.prototype.State);

Gem.prototype.GemType = {Normal:0, LineColumn:1, LineRow:2, Bomb:3, Wildcard: 4, Cross: 5 };
Object.freeze(Gem.prototype.GemType);

Gem.prototype.Init = function (Color, Pos) {
	this.m_Color = Color;
	this.m_TempPos = Pos;
	this.m_Type = this.GemType.Normal;
	this.m_State = this.State.Idle;
	this.m_Callback = null;
	this.m_Countdown = 0;
};

Gem.prototype.InitByState = function (State, Pos)
{
  this.m_Color = State.GemColor;
  this.m_TempPos = Pos;
  this.m_Type = this.State.GemType;
  this.m_State = this.State.Idle;
  this.m_Callback = null;
  this.m_Countdown = 0;
}

Gem.prototype.IsCanMove = function ()
{
  return this.m_State == this.State.Idle;
}

Gem.prototype.Update = function( DeltaTime)
{
  this.m_Countdown -= DeltaTime;
  if (this.m_Countdown <= 0)
  {
	this.m_State = this.State.Idle;
	if (this.m_Callback != null)
		this.m_Callback(this);

  }
}

Gem.prototype.SetCountdown = function( Cnt, Callback = null)
{
  this.m_Countdown = Cnt;
  this.m_State = this.State.Moving;
  this.m_Callback = Callback;
}

Gem.prototype.SetClear = function()
{
  this.m_State = this.State.Clear;
}

Gem.prototype.IsClear = function()
{
  return this.m_State == this.State.Clear;
}

//======
var GridState = function () {
	this.m_Gem = null;
};

GridState.prototype.GenGem = function( Color,   Pos) {
	if (this.m_Gem == null)
	{
		//this.m_Gem = new Gem(Color, Pos);
		this.m_Gem = new Gem();
		this.m_Gem.Init(Color, Pos);
	}
};

GridState.prototype.GenGemByInfo = function(GemInfo, Pos)
{
  if (this.m_Gem == null)
  {
	//this.m_Gem = new Gem(GemInfo, Pos);
	this.m_Gem = new Gem();
	this.m_Gem.Init(GemInfo, Pos);
  }
}

GridState.prototype.IsCanMove = function()
{
  if (this.m_Gem == null) return false;
  return this.m_Gem.IsCanMove();
}

GridState.prototype.Clear = function()
{
  this.m_Gem.SetClear();
}

//#endregion 
var gameState = gameState || {
	tempTouchPos : { x: 0, y : 0}
};

var match3 = match3 || {

	m_CBGenerate: null,
	m_CBClear: null,
	m_CBMove: null,
	m_CBLock: null,
	m_CBLog: null,
	m_CBLog2: null,

	m_SwipeRecs : [],
	m_Grid : [],
	m_PossibleMove : [],
	m_MatchRecs :[],
	m_GemForceRemoveList : [],
	m_IsHasMatch : false,

	Direction : {
		DOWN : 0,
		UP : 1,
		LEFT : 2,
		RIGHT : 3,
		LD : 4,
		RD : 5,
		LU : 6,
		RU : 7,
		MAX : 8
	},

	init : function(col_cnt, row_cnt, color_cnt) {

		this.m_Grid = [];
		this.m_Row = row_cnt;
		this.m_Col = col_cnt;
		this.m_ColorCount = color_cnt;
	},

	update : function(time_unit)
	{

		this.UpdateSwipe();
		this.updateGem(time_unit);

		this.ScanMatch();

		this.SpecialRemoveGem();
		this.GemDrop();
		this.generate(false);
		this.ScanMatchPossible();
		
	},


	SpecialRemoveGem: function()
	{
	  for(var i=0; i< this.m_GemForceRemoveList.length; ++i)
	  {
			var SpRemove = this.m_GemForceRemoveList[i];
		
			var PosIdx = 0, x = 0, y = 0;
			//while (SpRemove.Dequeue(ref PosIdx))
			while (true)
			{
				var rtn = SpRemove.Dequeue();
				if(rtn['result'] == false)    break;

				var p = GridIdxToPos(rtn['val']);
				x = p.x;
        y = p.y;
        var idx = rtn['val']
				if (this.m_Grid[idx].m_Gem == null || !this.m_Grid[idx].m_Gem.IsCanMove()) 
					continue;
				this.m_Grid[idx].m_Gem.SetCountdown(WAIT_UPDATE_TIME_UNIT, this.OnGemMatchClear);
				if (this.m_CBClear != null)
				{
					this.m_CBClear(x, y);
        }
      }
	  } 
    
	  this.m_GemForceRemoveList.length = 0;
	},

	OnGemMatchClear : function( TargetGem) // Gem
	{
	  TargetGem.SetClear();
  
	  if (TargetGem.m_Type == Gem.prototype.GemType.LineColumn)
	  {
		// test
		var SpMove = new SpecialRemove(TargetGem.m_Type);
		m_GemForceRemoveList.push(SpMove);
		for (var  i = 0; i < this.m_Row; ++i)
		{
      let idx = GridPosToIdx2(TargetGem.m_TempPos.x, i);
		  if (this.m_Grid[idx].m_Gem != null && this.m_Grid[idx].m_Gem.IsCanMove())
		  {
			SpMove.Enqueue(GridPosToIdx2(TargetGem.m_TempPos.x, i));
		  }
		}
  
	  }
	  if (TargetGem.m_Type == Gem.prototype.GemType.LineRow)
	  {
		var SpMove = new SpecialRemove(TargetGem.m_Type);
		m_GemForceRemoveList.push(SpMove);
	   
		for (var i = 0; i < this.m_Col; ++i)
		{
      let idx = GridPosToIdx2(i, TargetGem.m_TempPos.y);
		  if (this.m_Grid[idx].m_Gem != null && this.m_Grid[idx].m_Gem.IsCanMove())
		  {
			  SpMove.Enqueue(GridPosToIdx(i, TargetGem.m_TempPos.y));
		  }
		}
	  }
  
  
	  if (TargetGem.m_Type == Gem.prototype.GemType.Bomb )
	  {
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
    
      for (var i = ColMin; i <= ColMax; ++i)
      {
        for (var j = RowMin; j <= RowMax; ++j)
        {
          let idx = GridPosToIdx2(i, j);
          if (this.m_Grid[idx].m_Gem != null && this.m_Grid[idx].m_Gem.IsCanMove())
          {
            SpMove.Enqueue(GridPosToIdx(i, j));
          }
        }
      }
	  }
	},

	GemDrop :function()
	{
	  for (var i = 0; i < this.m_Col; ++i)
	  {
      var EmptyCnt = 0;
      for (var j = this.m_Row - 1; j >= 0; --j)
      {
        let curIdx = this.GridPosToIdx2(i, j);
        if (this.m_Grid[curIdx].m_Gem == null)
        {
          EmptyCnt++;
        }
        else
        {
          if (!this.m_Grid[curIdx].m_Gem.IsCanMove())
            EmptyCnt = 0;
      
          if (EmptyCnt == 0)
            continue;
      
          let dropIdx = this.GridPosToIdx2(i, (j + EmptyCnt));
          if (this.m_Grid[dropIdx].m_Gem == null ||
            this.m_Grid[dropIdx].m_Gem.IsCanMove())
          {
            this.ChangeGem(i, j, i, j + EmptyCnt);
            
          }
        }
      }
	  }
	},

	ScanMatch : function()
	{
	  
	  this.m_IsHasMatch = false;
	  this.m_MatchRecs.length = 0;
  
	  for (var i = 0; i < this.m_Col; ++i)
	  {
		for (var j = 0; j < this.m_Row; ++j)
		{
		  if (this.CheckMatch(i, j))
		  {
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
						this.m_Grid[idx].m_Gem.SetCountdown(WAIT_UPDATE_TIME_UNIT, this.OnGemMatchClear);
						if (this.m_CBClear != null) {
							this.m_CBClear(Pos[i].x, Pos[i].y);
						}
					}
				}
				continue;
			}
		}
	},

	CheckMatch : function( Col,  Row)
	{
    let idx = this.GridPosToIdx2(Col, Row);
	  if (!this.m_Grid[idx].IsCanMove())
		return false;
  
	  var CurrColor = this.GetMatchColor(Col, Row);
	  if (CurrColor == -1) return false;
  
  
	  // DOWN, UP, LEFT, RIGHT, LD, RD, LU, RU
	  var CheckPos =  [ [ 0, 1 ], [ 0, -1 ], [ -1, 0 ], [ 1, 0 ], [ -1, 1 ], [ 1, 1 ], [ -1, -1 ], [ 1, -1 ], ];
	  var CheckSameState = [ false, false, false, false, false, false, false, false ];
	  
	  var  IsMatch = false;
  
	  // check 8 way.
  
	  for(var i=0; i < match3.Direction.MAX; ++i )
	  {	
		CheckSameState[i] = this.SameColorCheck_( CurrColor, Col, Row, CheckPos[i][0], CheckPos[i][1] );
	  }
  
	  // ---
	  // ooo
	  // ---
	  if (CheckSameState[this.Direction.LEFT] && CheckSameState[this.Direction.RIGHT])
	  {
		this.m_MatchRecs.push( new MatchRecord(
		  Col + CheckPos[this.Direction.LEFT][0],
		  Row + CheckPos[this.Direction.LEFT][1],
		  Col + CheckPos[this.Direction.RIGHT][0],
		  Row + CheckPos[this.Direction.RIGHT][1]));
		IsMatch = true;
	  }
  
	  // -o-
	  // -o-
	  // -o-
	  if (CheckSameState[this.Direction.UP] && CheckSameState[this.Direction.DOWN])
	  {
		this.m_MatchRecs.push(new MatchRecord(
		  Col + CheckPos[this.Direction.UP][0],
		  Row + CheckPos[this.Direction.UP][1],
		  Col + CheckPos[this.Direction.DOWN][0],
		  Row + CheckPos[this.Direction.DOWN][1]));
		IsMatch = true;
	  }
  
	  return IsMatch;
	},

	SameColorCheck_: function( TargetColor,  TargetPosX,  TargetPosY,  PosOffsetX,  PosOffsetY)
	{
	  var Col = TargetPosX + PosOffsetX;
    var Row = TargetPosY + PosOffsetY;
    let idx = this.GridPosToIdx2(Col, Row);
	  if (Col >= 0 && Col < this.m_Col && Row >= 0 && Row < this.m_Row)
	  {
		if (this.m_Grid[idx].IsCanMove())
		  return (TargetColor == this.GetMatchColor(Col, Row));
	  }
	  return false;
	},

	GetMatchColor: function( Col,  Row)
	{
	  if (Col < 0 || Col >= this.m_Col) return -1;
    if (Row < 0 || Row >= this.m_Row) return -1;
    let idx = this.GridPosToIdx2(Col, Row);
	  if (this.m_Grid[idx].m_Gem === null)
		return -1;
	  return this.m_Grid[idx].m_Gem.m_Color;
	},

	ScanMatchPossible : function()
	{
	  this.m_PossibleMove.length = 0;
	  for (var i = 0; i < this.m_Col; ++i)
	  {
		for (var j = 0; j < this.m_Row; ++j)
		{
		  this.CheckMatchPossible(i, j);
		}
	  }
  
	},
  
	CheckMatchPossible : function( Col,  Row)
	{
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
  
	  do
	  {
		// 左移左
		if (CurrColor == this.GetColor(Col - 2, Row) && CurrColor == this.GetColor(Col - 3, Row))
		{
			this.m_PossibleMove.push(new MoveRecord(Col, Row, match3.Direction.LEFT));
		  break;
		}
		// 左移上
		if (CurrColor == this.GetColor(Col - 1, Row - 1) && CurrColor == this.GetColor(Col - 1, Row - 2))
		{
			this.m_PossibleMove.push(new MoveRecord(Col, Row, match3.Direction.LEFT));
		  break;
		}
		// 左移下
		if (CurrColor == this.GetColor(Col - 1, Row + 1) && CurrColor == this.GetColor(Col - 1, Row + 2))
		{
			this.m_PossibleMove.push(new MoveRecord(Col, Row, match3.Direction.LEFT));
		  break;
		}
		// 左移中
		if (CurrColor == this.GetColor(Col - 1, Row + 1) && CurrColor == this.GetColor(Col - 1, Row - 1))
		{
			this.m_PossibleMove.push(new MoveRecord(Col, Row, match3.Direction.LEFT));
		  break;
		}
  
		// 左移上方
		if (CurrColor == this.GetColor(Col - 1, Row - 1) && CurrColor == this.GetColor(Col - 2, Row - 1) && CurrColor == this.GetColor(Col - 2, Row ))
		{
			this.m_PossibleMove.push(new MoveRecord(Col, Row, match3.Direction.LEFT));
		  break;
		}
  
		// 左移下方
		if (CurrColor == this.GetColor(Col - 1, Row + 1) && CurrColor == this.GetColor(Col - 2, Row + 1) && CurrColor == this.GetColor(Col - 2, Row))
		{
			this.m_PossibleMove.push(new MoveRecord(Col, Row, match3.Direction.LEFT));
		  break;
		}
	  } while (false);
  
	  do
	  {
		// 右移右
		if (CurrColor == this.GetColor(Col + 2, Row) && CurrColor == this.GetColor(Col + 3, Row))
		{
			this.m_PossibleMove.push(new MoveRecord(Col, Row, match3.Direction.RIGHT));
		  break;
		}
		// 右移上
		if (CurrColor == this.GetColor(Col + 1, Row - 1) && CurrColor == this.GetColor(Col + 1, Row - 2))
		{
			this.m_PossibleMove.push(new MoveRecord(Col, Row, match3.Direction.RIGHT));
		  break;
		}
		// 右移下
		if (CurrColor == this.GetColor(Col + 1, Row + 1) && CurrColor == this.GetColor(Col + 1, Row + 2))
		{
			this.m_PossibleMove.push(new MoveRecord(Col, Row, match3.Direction.RIGHT));
		  break;
		}
		// 右移中
		if (CurrColor == this.GetColor(Col + 1, Row + 1) && CurrColor == this.GetColor(Col + 1, Row - 1))
		{
			this.m_PossibleMove.push(new MoveRecord(Col, Row, match3.Direction.RIGHT));
		  break;
		}
  
		// 右移上方
		if (CurrColor == this.GetColor(Col + 1, Row - 1) && CurrColor == this.GetColor(Col + 2, Row - 1) && CurrColor == this.GetColor(Col + 2, Row))
		{
			this.m_PossibleMove.push(new MoveRecord(Col, Row, match3.Direction.RIGHT));
		  break;
		}
  
		// 右移下方
		if (CurrColor == this.GetColor(Col + 1, Row + 1) && CurrColor == this.GetColor(Col + 2, Row + 1) && CurrColor == this.GetColor(Col + 2, Row))
		{
			this.m_PossibleMove.push(new MoveRecord(Col, Row, match3.Direction.RIGHT));
		  break;
		}
	  } while (false);
  
	  do
	  {
		// 上移上
		if (CurrColor == this.GetColor(Col, Row - 2) && CurrColor == this.GetColor(Col, Row - 3))
		{
			this.m_PossibleMove.push(new MoveRecord(Col, Row, match3.Direction.UP));
		  break;
		}
		// 上移左
		if (CurrColor == this.GetColor(Col - 1, Row - 1) && CurrColor == this.GetColor(Col - 2, Row - 1))
		{
			this.m_PossibleMove.push(new MoveRecord(Col, Row, match3.Direction.UP));
		  break;
		}
		// 上移右
		if (CurrColor == this.GetColor(Col + 1, Row - 1) && CurrColor == this.GetColor(Col + 2, Row - 1))
		{
			this.m_PossibleMove.push(new MoveRecord(Col, Row, match3.Direction.UP));
		  break;
		}
		// 上移中
		if (CurrColor == this.GetColor(Col + 1, Row - 1) && CurrColor == this.GetColor(Col - 1, Row - 1))
		{
			this. m_PossibleMove.push(new MoveRecord(Col, Row, match3.Direction.UP));
		  break;
		}
  
		// 上移左方
		if (CurrColor == this.GetColor(Col - 1, Row - 1) && CurrColor == this.GetColor(Col - 1, Row - 2) && CurrColor == this.GetColor(Col , Row - 2))
		{
			this.m_PossibleMove.push(new MoveRecord(Col, Row, match3.Direction.UP));
		  break;
		}
		// 上移右方
		if (CurrColor == this.GetColor(Col + 1, Row - 1) && CurrColor == this.GetColor(Col + 1, Row - 2) && CurrColor == this.GetColor(Col, Row - 2))
		{
			this.m_PossibleMove.push(new MoveRecord(Col, Row, match3.Direction.UP));
		  break;
		}
	  } while (false);
  
	  do
	  {
		// 下移下
		if (CurrColor == this.GetColor(Col, Row + 2) && CurrColor == this.GetColor(Col, Row + 3))
		{
			this.m_PossibleMove.push(new MoveRecord(Col, Row, match3.Direction.DOWN));
		  break;
		}
		// 下移左
		if (CurrColor == this.GetColor(Col - 1, Row + 1) && CurrColor == this.GetColor(Col - 2, Row + 1))
		{
			this.m_PossibleMove.push(new MoveRecord(Col, Row, match3.Direction.DOWN));
		  break;
		}
		// 下移右
		if (CurrColor == this.GetColor(Col + 1, Row + 1) && CurrColor == this.GetColor(Col + 2, Row + 1))
		{
			this.m_PossibleMove.push(new MoveRecord(Col, Row, match3.Direction.DOWN));
		  break;
		}
		// 下移中
		if (CurrColor == this.GetColor(Col + 1, Row + 1) && CurrColor == this.GetColor(Col - 1, Row + 1))
		{
			this.m_PossibleMove.push(new MoveRecord(Col, Row, match3.Direction.DOWN));
		  break;
		}
  
		// 下移左方
		if (CurrColor == this.GetColor(Col - 1, Row + 1) && CurrColor == this.GetColor(Col - 1, Row + 2) && CurrColor == this.GetColor(Col, Row + 2))
		{
			this.m_PossibleMove.push(new MoveRecord(Col, Row, match3.Direction.DOWN));
		  break;
		}
		// 下移右方
		if (CurrColor == this.GetColor(Col + 1, Row + 1) && CurrColor == this.GetColor(Col + 1, Row + 2) && CurrColor == this.GetColor(Col, Row + 2))
		{
			this.m_PossibleMove.push(new MoveRecord(Col, Row, match3.Direction.DOWN));
		  break;
		}
	  } while (false);
  
	  return Cnt;
	},

	updateGem : function(time_unit)
	{
		// 更新珠子, 清除已消除資料.
		for (var i = 0; i < this.m_Col; ++i)
		{
		for (var  j = 0; j < this.m_Row; ++j)
		{
      let idx = this.GridPosToIdx2(i, j);
			if (this.m_Grid[idx].m_Gem != null)
			{
				this.m_Grid[idx].m_Gem.Update(time_unit);
				if (this.m_Grid[idx].m_Gem.IsClear())
					this.m_Grid[idx].m_Gem = null;
			}
		}
		}
	},

	generate : function(is_init = false)
	{
		if (is_init)
		{
		  for (var  i = 0; i < this.m_Col; ++i)
		  {
        for (var j = 0; j < this.m_Row; ++j)
        {
          if (is_init)
          {
            let idx = this.GridPosToIdx2(i, j);
            this.m_Grid[idx] = new GridState();
            this.m_Grid[idx].GenGem(Math.floor(Math.random() *  this.m_ColorCount), new GridPos(i, j));
            this.m_Grid[idx].m_Gem.SetCountdown(WAIT_UPDATE_TIME_UNIT);
            if (this.m_CBGenerate != null)
            {
              this.m_CBGenerate(i, j, this.m_Grid[idx].m_Gem.m_Color, this.m_Grid[idx].m_Gem.m_Type, WAIT_UPDATE_TIME_UNIT2);
            }
          }
        }
		  }
		  return;
		}
	
		for (var i = 0; i < this.m_Col; ++i)
		{
		  for (var j = 0; j < this.m_Row; ++j)
		  {
        // 由上往下掃 空格補珠, 如果遇到阻塞就換column.
        let idx = this.GridPosToIdx2(i, j);
        if (this.m_Grid[idx].m_Gem == null)
        {
          this.m_Grid[idx].GenGem(Math.floor(Math.random() *  this.m_ColorCount), new GridPos(i, j));
          this.m_Grid[idx].m_Gem.SetCountdown(WAIT_UPDATE_TIME_UNIT2);
          if (this.m_CBGenerate != null)
          {
          this.m_CBGenerate(i, j, this.m_Grid[idx].m_Gem.m_Color, this.m_Grid[idx].m_Gem.m_Type, WAIT_UPDATE_TIME_UNIT2);
          }
          break;
        }
        else
        {
          if( !this.m_Grid[idx].m_Gem.IsCanMove())
          {
          break;
          }
        }
		  }
		}
	},

	GridPosToIdx : function(g) { return g.x + g.y * this.m_Col; },
	GridPosToIdx2 : function(x, y) { return x + y * this.m_Col;  },
	GridIdxToPos : function(idx) { return { x :  idx % m_Col,  y : idx / m_Col } },

	GetColor : function( Col,  Row)
	{
	  if (Col < 0 || Col >= this.m_Col) return -1;
    if (Row < 0 || Row >= this.m_Row) return -1;
    let idx = this.GridPosToIdx2(Col, Row);
	  if (this.m_Grid[idx].m_Gem === null)
		return -1;
	  return this.m_Grid[idx].m_Gem.Color;
	},

	swipe : function( Col,  Row,  Dir)
	{
	  var CurrColor = this.GetColor(Col, Row);
	  var Target = new GridPos(Col, Row);
  
	  switch (Dir)
	  {
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
  
	  this.m_SwipeRecs.push(new SwipeRecord(new GridPos(Col, Row), Target, SwipeRecord.prototype.START));
	  
	  return true;
	},

	UpdateSwipe : function()
	{
		// 執行swipe行為.
		for (var i = 0; i < this.m_SwipeRecs.length; ++i)
		{
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
  
			if (!Rec.IsEnd())
			{
				this.SwipeChangeGem(Rec.m_Pos1, Rec.m_Pos2);
				Rec.SetChanged();
			}
		}
		//m_SwipeRecs.RemoveAll( (SwipeRecord Rec) => { return Rec.IsEnd(); });

		if(this.m_SwipeRecs.length < 1)  return;

		for( var i = this.m_SwipeRecs.length-1; i--;){
			var Rec = this.m_SwipeRecs[i];
			if ( Rec.IsEnd()) 
				this.m_SwipeRecs.splice(i, 1);
		}
	},

	SwipeChangeGem : function( Pos1,  Pos2)
	{
	  var IsCanMatch = false;
	  for (var  i = 0; i < this.m_PossibleMove.length; ++i)
	  {
		var PossibleMove = this.m_PossibleMove[i];
		if (PossibleMove.IsEqual(Pos1.x, Pos1.y, this.GetDirection(Pos1.x, Pos1.y, Pos2.x, Pos2.y)))
		{
		  IsCanMatch = true;
		  break;
		}
  
		if (PossibleMove.IsEqual(Pos2.x, Pos2.y, this.GetDirection(Pos2.x, Pos2.y, Pos1.x, Pos1.y)))
		{
		  IsCanMatch = true;
		  break;
		}
	  }
  
	  this.ChangeGem( Pos1.x,  Pos1.y,  Pos2.x,  Pos2.y, IsCanMatch);
	},

	GetDirection: function( Fromx1,  Fromy1,  Tox2,  Toy2)
	{
	  if (Fromx1 > Tox2)
		return this.Direction.LEFT;
	  else if (Fromx1 < Tox2)
		return this.Direction.RIGHT;
	  else
	  {
		if (Fromy1 > Toy2)
		  return this.Direction.UP;
		else
		  return this.Direction.DOWN;
	  }
	},

	ChangeGem : function( x1,  y1,  x2,  y2,  oneWay = true)
	{
    let idx1 = this.GridPosToIdx2(x1, y1);
    let idx2 = this.GridPosToIdx2(x2, y2);

	  var Grid1 = this.m_Grid[idx1];
	  var Grid2 = this.m_Grid[idx2];
  
	  if (true)
	  {
      var Tmp = Grid1.m_Gem;
      Grid1.m_Gem = Grid2.m_Gem;
      Grid2.m_Gem = Tmp;
    
      if (Grid1.m_Gem != null)
      {
        Grid1.m_Gem.m_TempPos.x = x1;
        Grid1.m_Gem.m_TempPos.y = y1;
      }
      if (Grid2.m_Gem != null)
      {
        Grid2.m_Gem.m_TempPos.x = x2;
        Grid2.m_Gem.m_TempPos.y = y2;
      }
    
      this.m_CBMove(x1, y1, x2, y2, 1);
    
      if (this.m_Grid[idx1].m_Gem != null)
        this.m_Grid[idx1].m_Gem.SetCountdown(WAIT_UPDATE_TIME_UNIT2);
      if (this.m_Grid[idx2].m_Gem != null)
        this. m_Grid[idx2].m_Gem.SetCountdown(WAIT_UPDATE_TIME_UNIT2);
	  }
	  else
	  {
      this.m_CBMove(x1, y1, x2, y2, 2);
    
      if (this.m_Grid[idx1].m_Gem != null)
        this.m_Grid[idx1].m_Gem.SetCountdown(WAIT_UPDATE_TIME_UNIT * 2);
      if (this.m_Grid[idx2].m_Gem != null)
        this.m_Grid[idx2].m_Gem.SetCountdown(WAIT_UPDATE_TIME_UNIT * 2);
	  }
  
	}
};


var app = new PIXI.Application(600, 800, {backgroundColor : 0x1099bb});
document.body.appendChild(app.view);

PIXI.loader
	.add("res/candy1_blue_01.png","res/candy1_blue_01.png")
	.add("res/candy1_green_01.png","res/candy1_green_01.png")
	.add("res/candy1_orange_01.png","res/candy1_orange_01.png")
	.add("res/candy1_purple_01.png","res/candy1_purple_01.png")
	.add("res/candy1_red_01.png","res/candy1_red_01.png")
	.add("res/candy1_yellow_01.png","res/candy1_yellow_01.png")

	

    .load(onAssetsLoaded);


match3.init(8, 8, 6);


//onAssetsLoaded handler builds the example.
function onAssetsLoaded()
{
	var match3Textures = [
		PIXI.Texture.fromImage("res/candy1_blue_01.png"),
		PIXI.Texture.fromImage("res/candy1_green_01.png"),
		PIXI.Texture.fromImage("res/candy1_orange_01.png"),
		PIXI.Texture.fromImage("res/candy1_purple_01.png"),
		PIXI.Texture.fromImage("res/candy1_red_01.png"),
		PIXI.Texture.fromImage("res/candy1_yellow_01.png"),
	];

	var Grid = [];
	var gemContainer = new PIXI.Container();

	match3.m_CBGenerate = function(x, y, color, type, time)
	{
		//console.log(x, y, color, type, time);
		var gem = new PIXI.Sprite(match3Textures[ color]);
		gem.y = y * 70;
		gem.scale.x = gem.scale.y = 0.5;
		gem.alpha = 0;
		gem.x = x * 70;
		gem.interactive = true;
		gem.touchstart = gem.mousedown = onDragStart;
		gem.touchend = gem.mouseup = onDragEnd;
		//GemInst.transform.DOScale(1.3f, TimeUnit * 0.001f);

		gemContainer.addChild(gem);

		tweenTo(gem, "alpha", 1, WAIT_UPDATE_TIME_UNIT, backout(0.6), null, null);

    let idx = match3.GridPosToIdx2(x, y);
		Grid[idx] = gem;
	}

	match3.m_CBMove = function(Col,  Row,  TargetCol,  TargetRow,  MoveType)
	{
    //console.log(x, y, color, type, time);
    let idxA = match3.GridPosToIdx2(Col, Row);
    let idxB = match3.GridPosToIdx2(TargetCol, TargetRow);

		var GemA = Grid[ idxA];
		var GemB = Grid[ idxB];
	
		/*if (MoveType == MatchThreeCore.MOVE_TYPE_MOVE)
		{
		  GemA.DOMove(m_GemPos[TargetCol, TargetRow], 0.1f );
	
		  m_GemGrid[Col, Row] =  null;
		  m_GemGrid[TargetCol, TargetRow] = GemA;
		}
		else */
		if (MoveType == 1)
		{
		  //GemA.DOMove(m_GemPos[TargetCol, TargetRow], 0.1f );
		  //GemB.DOMove(m_GemPos[Col, Row], 0.1f );
		  //var tempx = GemB.x;
		  //var tempy = GemB.y;
		  if(GemB != null)
		  {
			//GemB.x = Col * 70;
			//GemB.y = Row * 70;
			tweenTo(GemB, "x", Col * 70, WAIT_UPDATE_TIME_UNIT, backout(0.6), null, null);
			tweenTo(GemB, "y", Row * 70, WAIT_UPDATE_TIME_UNIT, backout(0.6), null, null);
		  }

		  if(GemA != null)
		  {
			//GemA.x = TargetCol * 70;
			//GemA.y = TargetRow * 70;
			tweenTo(GemA, "x", TargetCol * 70, WAIT_UPDATE_TIME_UNIT, backout(0.6), null, null);
			tweenTo(GemA, "y", TargetRow * 70, WAIT_UPDATE_TIME_UNIT, backout(0.6), null, null);
		  }
	
		  Grid[idxA] = GemB;
		  Grid[idxB] = GemA;
		}
		else if (MoveType == 2)
		{
		  //GemA.DOMove(m_GemPos[TargetCol, TargetRow], 0.1f ).SetLoops(2, LoopType.Yoyo);
		  //GemB.DOMove(m_GemPos[Col, Row], 0.1f ).SetLoops(2, LoopType.Yoyo);
		}
	}


	match3.m_CBClear = function(x, y)
	{
    let idx = match3.GridPosToIdx2(x, y);
	  if (Grid[idx] == null)
	  {
		console.log("error" , x, y);
		return;
	  }
  
	  var Gem = Grid[idx];
	  Grid[idx] = null;
	  
	  tweenTo(Gem, "alpha", 0, WAIT_CLEAR_TIME_UNIT, backout(0.6), null, function(){gemContainer.removeChild(Gem);});

	  
	}

	app.stage.addChild(gemContainer);
	match3.generate(true);

	function onDragStart(event)
	{
		gameState.tempTouchPos.x = event.data.global.x ;
		gameState.tempTouchPos.y = event.data.global.y;
		//console.log(event.data.global );
	}

	function onDragEnd(event)
	{

		console.log(gameState.tempTouchPos);
		
		console.log(event.data.global );

		var SwipeDeltaX = event.data.global.x - gameState.tempTouchPos.x;
		var SwipeDeltaY = event.data.global.y - gameState.tempTouchPos.y;

		if( Math.abs( SwipeDeltaX ) < Math.abs( SwipeDeltaY )  )
		{
			if (SwipeDeltaY < 0)
			{
				match3.swipe( Math.floor( gameState.tempTouchPos.x / 70 ), Math.floor( gameState.tempTouchPos.y / 70 ), match3.Direction.UP);
			}
			if (SwipeDeltaY > 0)
			{
				match3.swipe( Math.floor( gameState.tempTouchPos.x / 70 ), Math.floor( gameState.tempTouchPos.y / 70 ), match3.Direction.DOWN);
			}
		}

		else //if( Math.abs( SwipeDeltaX ) > Math.abs( SwipeDeltaY ) )
		{
			if (SwipeDeltaX > 0)
			{
				match3.swipe( Math.floor( gameState.tempTouchPos.x / 70 ), Math.floor( gameState.tempTouchPos.y / 70 ), match3.Direction.RIGHT);
			}
			if (SwipeDeltaX < 0)
			{
				match3.swipe( Math.floor( gameState.tempTouchPos.x / 70 ), Math.floor( gameState.tempTouchPos.y / 70 ), match3.Direction.LEFT);
			}
		}

	}


	//Build the reels
	/*var reels = [];
	var reelContainer = new PIXI.Container();
	for( var i = 0; i < 5; i++)
	{
		var rc = new PIXI.Container();
		rc.x = i*REEL_WIDTH;
		reelContainer.addChild(rc);
		
		var reel = {
			container: rc,
			symbols:[],
			position:0,
			previousPosition:0,
			blur: new PIXI.filters.BlurFilter()
		};
		reel.blur.blurX = 0;
		reel.blur.blurY = 0;
		rc.filters = [reel.blur];
		
		//Build the symbols
		for(var j = 0; j < 4; j++)
		{
			var symbol = new PIXI.Sprite(slotTextures[ Math.floor(Math.random()*slotTextures.length)]);
			//Scale the symbol to fit symbol area.
			symbol.y = j*SYMBOL_SIZE;
			symbol.scale.x = symbol.scale.y = Math.min( SYMBOL_SIZE / symbol.width, SYMBOL_SIZE/symbol.height);
			symbol.x = Math.round((SYMBOL_SIZE - symbol.width)/2);
			reel.symbols.push( symbol );
			rc.addChild(symbol);
		}
		reels.push(reel);
	}
	app.stage.addChild(reelContainer);
	
	//Build top & bottom covers and position reelContainer
	var margin = (app.screen.height - SYMBOL_SIZE*3)/2;
	reelContainer.y = margin;
	reelContainer.x = Math.round(app.screen.width - REEL_WIDTH*5);
	var top = new PIXI.Graphics();
	top.beginFill(0,1);
	top.drawRect(0,0, app.screen.width, margin);
	var bottom = new PIXI.Graphics();
	bottom.beginFill(0,1);
	bottom.drawRect(0,SYMBOL_SIZE*3+margin,app.screen.width, margin);
	
	//Add play text
	var style = new PIXI.TextStyle({
		fontFamily: 'Arial',
		fontSize: 36,
		fontStyle: 'italic',
		fontWeight: 'bold',
		fill: ['#ffffff', '#00ff99'], // gradient
		stroke: '#4a1850',
		strokeThickness: 5,
		dropShadow: true,
		dropShadowColor: '#000000',
		dropShadowBlur: 4,
		dropShadowAngle: Math.PI / 6,
		dropShadowDistance: 6,
		wordWrap: true,
		wordWrapWidth: 440
	});
	
	var playText = new PIXI.Text('Spin the wheels!', style);
	playText.x = Math.round((bottom.width - playText.width)/2);
	playText.y = app.screen.height-margin + Math.round((margin-playText.height)/2);
	bottom.addChild(playText);
	
	//Add header text
	var headerText = new PIXI.Text('PIXI MONSTER SLOTS!', style);
	headerText.x = Math.round((top.width - headerText.width)/2);
	headerText.y = Math.round((margin-headerText.height)/2);
	top.addChild(headerText);
	
	app.stage.addChild(top);
	app.stage.addChild(bottom);
	
	//Set the interactivity.
	bottom.interactive = true;
	bottom.buttonMode = true;
	bottom.addListener("pointerdown", function(){
		startPlay();
	});
	
	var running = false;
	
	//Function to start playing.
	function startPlay(){
		if(running) return;
		running = true;
		
		for(var i = 0; i < reels.length; i++)
		{
			var r = reels[i];
			var extra = Math.floor(Math.random()*3);
			tweenTo(r, "position", r.position + 10+i*5+extra, 2500+i*600+extra*600, backout(0.6), null, i == reels.length-1 ? reelsComplete : null);
		}
	}
	
	//Reels done handler.
	function reelsComplete(){
		running = false;
	}
	*/

	// Listen for animate update.
	app.ticker.add(function(delta) {
		match3.update(delta * app.ticker.elapsedMS );

		//Update the slots.
		/*for( var i = 0; i < reels.length; i++)
		{
			var r = reels[i];
			//Update blur filter y amount based on speed.
			//This would be better if calculated with time in mind also. Now blur depends on frame rate.
			r.blur.blurY = (r.position-r.previousPosition)*8;
			r.previousPosition = r.position;
			
			//Update symbol positions on reel.
			for( var j = 0; j < r.symbols.length; j++)
			{
				var s = r.symbols[j];
				var prevy = s.y;
				s.y = (r.position + j)%r.symbols.length*SYMBOL_SIZE-SYMBOL_SIZE;
				if(s.y < 0 && prevy > SYMBOL_SIZE){
					//Detect going over and swap a texture. 
					//This should in proper product be determined from some logical reel.
					s.texture = slotTextures[Math.floor(Math.random()*slotTextures.length)];
					s.scale.x = s.scale.y = Math.min( SYMBOL_SIZE / s.texture.width, SYMBOL_SIZE/s.texture.height);
					s.x = Math.round((SYMBOL_SIZE - s.width)/2);
				}
			}
		}*/
	});
}

//Very simple tweening utility function. This should be replaced with a proper tweening library in a real product.
var tweening = [];
function tweenTo(object, property, target, time, easing, onchange, oncomplete)
{
	var tween = {
		object:object,
		property:property,
		propertyBeginValue:object[property],
		target:target,
		easing:easing,
		time:time,
		change:onchange,
		complete:oncomplete,
		start:Date.now()
	};
	
	tweening.push(tween);
	return tween;
}
// Listen for animate update.
app.ticker.add(function(delta) {
	var now = Date.now();
	var remove = [];
	for(var i = 0; i < tweening.length; i++)
	{
		var t = tweening[i];
		var phase = Math.min(1,(now-t.start)/t.time);
		
		t.object[t.property] = lerp(t.propertyBeginValue, t.target, t.easing(phase));
		if(t.change) t.change(t);
		if(phase == 1)
		{
			t.object[t.property] = t.target;
			if(t.complete)
				t.complete(t);
			remove.push(t);
		}
	}
	for(var i = 0; i < remove.length; i++)
	{
		tweening.splice(tweening.indexOf(remove[i]),1);
	}
});

//Basic lerp funtion.
function lerp(a1,a2,t){
	return a1*(1-t) + a2*t;
};

//Backout function from tweenjs.
//https://github.com/CreateJS/TweenJS/blob/master/src/tweenjs/Ease.js
function backout(amount) {
	return function(t) {
		return (--t*t*((amount+1)*t + amount) + 1);
	};
};
