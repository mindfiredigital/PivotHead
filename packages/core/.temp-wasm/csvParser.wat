(module
 (type $0 (func (param i32) (result i32)))
 (type $1 (func (param i32 i32) (result i32)))
 (type $2 (func (param i32 i32)))
 (type $3 (func (param i32)))
 (type $4 (func (param i32 f64)))
 (type $5 (func (result i32)))
 (type $6 (func (result f64)))
 (type $7 (func (param i32) (result f64)))
 (type $8 (func))
 (type $9 (func (param i32 i32 i32 i32)))
 (type $10 (func (param i32 f64) (result f64)))
 (type $11 (func (param i32 f64 i32 i32) (result f64)))
 (type $12 (func (param i32 i32 i32) (result i32)))
 (type $13 (func (param i32 i32 i32 i32) (result i32)))
 (type $14 (func (param i32 f64 f64 i32) (result i32)))
 (type $15 (func (param f64 f64) (result f64)))
 (import "env" "abort" (func $~lib/builtins/abort (param i32 i32 i32 i32)))
 (global $~lib/rt/stub/offset (mut i32) (i32.const 0))
 (global $assembly/csvParser/lastResult (mut i32) (i32.const 0))
 (global $~argumentsLength (mut i32) (i32.const 0))
 (global $~lib/rt/__rtti_base i32 (i32.const 1536))
 (memory $0 1)
 (data $0 (i32.const 1036) "<")
 (data $0.1 (i32.const 1048) "\02\00\00\00(\00\00\00A\00l\00l\00o\00c\00a\00t\00i\00o\00n\00 \00t\00o\00o\00 \00l\00a\00r\00g\00e")
 (data $1 (i32.const 1100) "<")
 (data $1.1 (i32.const 1112) "\02\00\00\00\1e\00\00\00~\00l\00i\00b\00/\00r\00t\00/\00s\00t\00u\00b\00.\00t\00s")
 (data $2 (i32.const 1164) "\1c")
 (data $2.1 (i32.const 1176) "\02")
 (data $3 (i32.const 1196) ",")
 (data $3.1 (i32.const 1208) "\02\00\00\00\16\00\00\00E\00m\00p\00t\00y\00 \00i\00n\00p\00u\00t")
 (data $4 (i32.const 1244) "\1c")
 (data $4.1 (i32.const 1256) "\02\00\00\00\04\00\00\00\"\00\"")
 (data $5 (i32.const 1276) "\1c")
 (data $5.1 (i32.const 1288) "\02\00\00\00\02\00\00\00\"")
 (data $6 (i32.const 1308) "\1c")
 (data $6.1 (i32.const 1320) "\02\00\00\00\08\00\00\00n\00u\00l\00l")
 (data $7 (i32.const 1340) "\1c")
 (data $7.1 (i32.const 1352) "\02\00\00\00\08\00\00\00N\00U\00L\00L")
 (data $8 (i32.const 1372) "\1c")
 (data $8.1 (i32.const 1384) "\02\00\00\00\08\00\00\00t\00r\00u\00e")
 (data $9 (i32.const 1404) "\1c")
 (data $9.1 (i32.const 1416) "\02\00\00\00\n\00\00\00f\00a\00l\00s\00e")
 (data $10 (i32.const 1436) "\1c")
 (data $10.1 (i32.const 1448) "\02\00\00\00\08\00\00\00T\00R\00U\00E")
 (data $11 (i32.const 1468) "\1c")
 (data $11.1 (i32.const 1480) "\02\00\00\00\n\00\00\00F\00A\00L\00S\00E")
 (data $12 (i32.const 1500) "\1c")
 (data $12.1 (i32.const 1512) "\02\00\00\00\n\00\00\001\00.\000\00.\000")
 (data $13 (i32.const 1536) "\06\00\00\00 \00\00\00 \00\00\00 ")
 (data $13.1 (i32.const 1560) " ")
 (export "getLastRowCount" (func $assembly/csvParser/getLastRowCount))
 (export "getLastColCount" (func $assembly/csvParser/getLastColCount))
 (export "getLastErrorCode" (func $assembly/csvParser/getLastErrorCode))
 (export "getLastErrorMessage" (func $assembly/csvParser/getLastErrorMessage))
 (export "parseCSVChunk" (func $assembly/csvParser/parseCSVChunk@varargs))
 (export "extractField" (func $assembly/csvParser/extractField))
 (export "parseNumber" (func $assembly/csvParser/parseNumber))
 (export "detectFieldType" (func $assembly/csvParser/detectFieldType))
 (export "estimateMemory" (func $assembly/csvParser/estimateMemory))
 (export "initialize" (func $assembly/csvParser/initialize))
 (export "getVersion" (func $assembly/csvParser/getVersion))
 (export "benchmark" (func $assembly/csvParser/benchmark))
 (export "__new" (func $~lib/rt/stub/__new))
 (export "__pin" (func $~lib/rt/stub/__pin))
 (export "__unpin" (func $~lib/rt/stub/__unpin))
 (export "__collect" (func $~lib/rt/stub/__collect))
 (export "__rtti_base" (global $~lib/rt/__rtti_base))
 (export "memory" (memory $0))
 (export "__setArgumentsLength" (func $~setArgumentsLength))
 (start $~start)
 (func $~lib/rt/stub/maybeGrowMemory (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  memory.size
  local.tee $1
  i32.const 16
  i32.shl
  i32.const 15
  i32.add
  i32.const -16
  i32.and
  local.tee $2
  local.get $0
  i32.lt_u
  if
   local.get $1
   local.get $0
   local.get $2
   i32.sub
   i32.const 65535
   i32.add
   i32.const -65536
   i32.and
   i32.const 16
   i32.shr_u
   local.tee $2
   local.get $1
   local.get $2
   i32.gt_s
   select
   memory.grow
   i32.const 0
   i32.lt_s
   if
    local.get $2
    memory.grow
    i32.const 0
    i32.lt_s
    if
     unreachable
    end
   end
  end
  local.get $0
  global.set $~lib/rt/stub/offset
 )
 (func $~lib/rt/common/BLOCK#set:mmInfo (param $0 i32) (param $1 i32)
  local.get $0
  local.get $1
  i32.store
 )
 (func $~lib/rt/stub/__alloc (param $0 i32) (result i32)
  (local $1 i32)
  (local $2 i32)
  local.get $0
  i32.const 1073741820
  i32.gt_u
  if
   i32.const 1056
   i32.const 1120
   i32.const 33
   i32.const 29
   call $~lib/builtins/abort
   unreachable
  end
  global.get $~lib/rt/stub/offset
  local.set $1
  global.get $~lib/rt/stub/offset
  i32.const 4
  i32.add
  local.tee $2
  local.get $0
  i32.const 19
  i32.add
  i32.const -16
  i32.and
  i32.const 4
  i32.sub
  local.tee $0
  i32.add
  call $~lib/rt/stub/maybeGrowMemory
  local.get $1
  local.get $0
  call $~lib/rt/common/BLOCK#set:mmInfo
  local.get $2
 )
 (func $~lib/rt/common/OBJECT#set:rtSize (param $0 i32) (param $1 i32)
  local.get $0
  local.get $1
  i32.store offset=16
 )
 (func $~lib/rt/stub/__new (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  local.get $0
  i32.const 1073741804
  i32.gt_u
  if
   i32.const 1056
   i32.const 1120
   i32.const 86
   i32.const 30
   call $~lib/builtins/abort
   unreachable
  end
  local.get $0
  i32.const 16
  i32.add
  call $~lib/rt/stub/__alloc
  local.tee $3
  i32.const 4
  i32.sub
  local.tee $2
  i32.const 0
  i32.store offset=4
  local.get $2
  i32.const 0
  i32.store offset=8
  local.get $2
  local.get $1
  i32.store offset=12
  local.get $2
  local.get $0
  call $~lib/rt/common/OBJECT#set:rtSize
  local.get $3
  i32.const 16
  i32.add
 )
 (func $~lib/object/Object#constructor (param $0 i32) (result i32)
  local.get $0
  if (result i32)
   local.get $0
  else
   i32.const 0
   i32.const 0
   call $~lib/rt/stub/__new
  end
 )
 (func $assembly/csvParser/CSVResult#set:rowCount (param $0 i32) (param $1 f64)
  local.get $0
  local.get $1
  f64.store
 )
 (func $assembly/csvParser/CSVResult#set:colCount (param $0 i32) (param $1 f64)
  local.get $0
  local.get $1
  f64.store offset=8
 )
 (func $assembly/csvParser/CSVResult#set:errorCode (param $0 i32) (param $1 f64)
  local.get $0
  local.get $1
  f64.store offset=16
 )
 (func $assembly/csvParser/CSVResult#set:errorMessage (param $0 i32) (param $1 i32)
  local.get $0
  local.get $1
  i32.store offset=24
 )
 (func $assembly/csvParser/CSVResult#constructor (result i32)
  (local $0 i32)
  i32.const 28
  i32.const 4
  call $~lib/rt/stub/__new
  call $~lib/object/Object#constructor
  local.tee $0
  f64.const 0
  call $assembly/csvParser/CSVResult#set:rowCount
  local.get $0
  f64.const 0
  call $assembly/csvParser/CSVResult#set:colCount
  local.get $0
  f64.const 0
  call $assembly/csvParser/CSVResult#set:errorCode
  local.get $0
  i32.const 1184
  call $assembly/csvParser/CSVResult#set:errorMessage
  local.get $0
 )
 (func $assembly/csvParser/getLastRowCount (result f64)
  global.get $assembly/csvParser/lastResult
  f64.load
 )
 (func $assembly/csvParser/getLastColCount (result f64)
  global.get $assembly/csvParser/lastResult
  f64.load offset=8
 )
 (func $assembly/csvParser/getLastErrorCode (result f64)
  global.get $assembly/csvParser/lastResult
  f64.load offset=16
 )
 (func $assembly/csvParser/getLastErrorMessage (result i32)
  global.get $assembly/csvParser/lastResult
  i32.load offset=24
 )
 (func $~lib/string/String#get:length (param $0 i32) (result i32)
  local.get $0
  i32.const 20
  i32.sub
  i32.load offset=16
  i32.const 1
  i32.shr_u
 )
 (func $assembly/csvParser/ParseState#set:inQuotes (param $0 i32) (param $1 i32)
  local.get $0
  local.get $1
  i32.store8 offset=24
 )
 (func $~lib/string/String#charCodeAt (param $0 i32) (param $1 i32) (result i32)
  local.get $0
  call $~lib/string/String#get:length
  local.get $1
  i32.le_u
  if
   i32.const -1
   return
  end
  local.get $0
  local.get $1
  i32.const 1
  i32.shl
  i32.add
  i32.load16_u
 )
 (func $assembly/csvParser/parseCSVChunk (param $0 i32) (param $1 f64) (result f64)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  call $assembly/csvParser/CSVResult#constructor
  global.set $assembly/csvParser/lastResult
  local.get $0
  call $~lib/string/String#get:length
  i32.eqz
  if
   global.get $assembly/csvParser/lastResult
   f64.const 1
   call $assembly/csvParser/CSVResult#set:errorCode
   global.get $assembly/csvParser/lastResult
   i32.const 1216
   call $assembly/csvParser/CSVResult#set:errorMessage
   f64.const 1
   return
  end
  i32.const 40
  i32.const 5
  call $~lib/rt/stub/__new
  call $~lib/object/Object#constructor
  local.tee $4
  f64.const 0
  call $assembly/csvParser/CSVResult#set:rowCount
  local.get $4
  f64.const 0
  call $assembly/csvParser/CSVResult#set:colCount
  local.get $4
  f64.const 0
  call $assembly/csvParser/CSVResult#set:errorCode
  local.get $4
  i32.const 0
  call $assembly/csvParser/ParseState#set:inQuotes
  local.get $4
  f64.const 0
  f64.store offset=32
  local.get $0
  call $~lib/string/String#get:length
  local.set $7
  loop $while-continue|0
   local.get $4
   f64.load
   local.get $7
   f64.convert_i32_s
   f64.lt
   if
    local.get $0
    local.get $4
    f64.load
    i32.trunc_sat_f64_s
    call $~lib/string/String#charCodeAt
    local.tee $5
    f64.convert_i32_s
    f64.const 34
    f64.eq
    if
     local.get $4
     local.get $4
     i32.load8_u offset=24
     i32.eqz
     call $assembly/csvParser/ParseState#set:inQuotes
    else
     local.get $4
     i32.load8_u offset=24
     i32.eqz
     if
      local.get $5
      f64.convert_i32_s
      local.get $1
      f64.eq
      if
       local.get $3
       i32.const 1
       i32.add
       local.set $3
      else
       local.get $5
       f64.convert_i32_s
       f64.const 10
       f64.eq
       if (result i32)
        i32.const 1
       else
        local.get $5
        f64.convert_i32_s
        f64.const 13
        f64.eq
        if (result i32)
         local.get $7
         f64.convert_i32_s
         local.get $4
         f64.load
         f64.const 1
         f64.add
         f64.gt
        else
         i32.const 0
        end
        if (result i32)
         local.get $0
         local.get $4
         f64.load
         f64.const 1
         f64.add
         i32.trunc_sat_f64_s
         call $~lib/string/String#charCodeAt
         f64.convert_i32_s
         f64.const 10
         f64.eq
        else
         i32.const 0
        end
       end
       if
        local.get $3
        i32.const 1
        i32.add
        local.tee $3
        local.get $2
        i32.gt_s
        if
         local.get $3
         local.set $2
        end
        local.get $6
        i32.const 1
        i32.add
        local.set $6
        i32.const 0
        local.set $3
        local.get $5
        f64.convert_i32_s
        f64.const 13
        f64.eq
        if (result i32)
         local.get $7
         f64.convert_i32_s
         local.get $4
         f64.load
         f64.const 1
         f64.add
         f64.gt
        else
         i32.const 0
        end
        if
         local.get $4
         local.get $4
         f64.load
         f64.const 1
         f64.add
         call $assembly/csvParser/CSVResult#set:rowCount
        end
       end
      end
     end
    end
    local.get $4
    local.get $4
    f64.load
    f64.const 1
    f64.add
    call $assembly/csvParser/CSVResult#set:rowCount
    br $while-continue|0
   end
  end
  local.get $3
  i32.const 0
  i32.gt_s
  if
   local.get $6
   i32.const 1
   i32.add
   local.set $6
   local.get $3
   local.get $2
   local.get $2
   local.get $3
   i32.lt_s
   select
   local.set $2
  end
  global.get $assembly/csvParser/lastResult
  local.get $6
  f64.convert_i32_s
  call $assembly/csvParser/CSVResult#set:rowCount
  global.get $assembly/csvParser/lastResult
  local.get $2
  f64.convert_i32_s
  call $assembly/csvParser/CSVResult#set:colCount
  global.get $assembly/csvParser/lastResult
  f64.const 0
  call $assembly/csvParser/CSVResult#set:errorCode
  f64.const 0
 )
 (func $assembly/csvParser/parseCSVChunk@varargs (param $0 i32) (param $1 f64) (param $2 i32) (param $3 i32) (result f64)
  block $3of3
   block $0of3
    block $outOfRange
     global.get $~argumentsLength
     i32.const 1
     i32.sub
     br_table $0of3 $3of3 $3of3 $3of3 $outOfRange
    end
    unreachable
   end
   f64.const 44
   local.set $1
  end
  local.get $0
  local.get $1
  call $assembly/csvParser/parseCSVChunk
 )
 (func $~lib/string/String#substring (param $0 i32) (param $1 i32) (param $2 i32) (result i32)
  (local $3 i32)
  (local $4 i32)
  local.get $1
  i32.const 0
  local.get $1
  i32.const 0
  i32.gt_s
  select
  local.tee $3
  local.get $0
  call $~lib/string/String#get:length
  local.tee $1
  local.get $1
  local.get $3
  i32.gt_s
  select
  local.tee $3
  local.get $2
  i32.const 0
  local.get $2
  i32.const 0
  i32.gt_s
  select
  local.tee $2
  local.get $1
  local.get $1
  local.get $2
  i32.gt_s
  select
  local.tee $2
  local.get $2
  local.get $3
  i32.gt_s
  select
  i32.const 1
  i32.shl
  local.set $4
  local.get $3
  local.get $2
  local.get $2
  local.get $3
  i32.lt_s
  select
  i32.const 1
  i32.shl
  local.tee $2
  local.get $4
  i32.sub
  local.tee $3
  i32.eqz
  if
   i32.const 1184
   return
  end
  local.get $4
  i32.eqz
  local.get $2
  local.get $1
  i32.const 1
  i32.shl
  i32.eq
  i32.and
  if
   local.get $0
   return
  end
  local.get $3
  i32.const 2
  call $~lib/rt/stub/__new
  local.tee $1
  local.get $0
  local.get $4
  i32.add
  local.get $3
  memory.copy
  local.get $1
 )
 (func $~lib/util/string/compareImpl (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (result i32)
  (local $4 i32)
  local.get $0
  local.get $1
  i32.const 1
  i32.shl
  i32.add
  local.set $1
  loop $while-continue|0
   local.get $3
   local.tee $0
   i32.const 1
   i32.sub
   local.set $3
   local.get $0
   if
    local.get $1
    i32.load16_u
    local.tee $0
    local.get $2
    i32.load16_u
    local.tee $4
    i32.ne
    if
     local.get $0
     local.get $4
     i32.sub
     return
    end
    local.get $1
    i32.const 2
    i32.add
    local.set $1
    local.get $2
    i32.const 2
    i32.add
    local.set $2
    br $while-continue|0
   end
  end
  i32.const 0
 )
 (func $~lib/string/String.__eq (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  local.get $0
  local.get $1
  i32.eq
  if
   i32.const 1
   return
  end
  local.get $1
  i32.eqz
  local.get $0
  i32.eqz
  i32.or
  if
   i32.const 0
   return
  end
  local.get $0
  call $~lib/string/String#get:length
  local.set $2
  local.get $1
  call $~lib/string/String#get:length
  local.get $2
  i32.ne
  if
   i32.const 0
   return
  end
  local.get $0
  i32.const 0
  local.get $1
  local.get $2
  call $~lib/util/string/compareImpl
  i32.eqz
 )
 (func $~lib/string/String#indexOf (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  i32.const 1264
  call $~lib/string/String#get:length
  local.tee $2
  i32.eqz
  if
   i32.const 0
   return
  end
  local.get $0
  call $~lib/string/String#get:length
  local.tee $3
  i32.eqz
  if
   i32.const -1
   return
  end
  local.get $1
  i32.const 0
  local.get $1
  i32.const 0
  i32.gt_s
  select
  local.tee $1
  local.get $3
  local.get $1
  local.get $3
  i32.lt_s
  select
  local.set $1
  local.get $3
  local.get $2
  i32.sub
  local.set $3
  loop $for-loop|0
   local.get $1
   local.get $3
   i32.le_s
   if
    local.get $0
    local.get $1
    i32.const 1264
    local.get $2
    call $~lib/util/string/compareImpl
    i32.eqz
    if
     local.get $1
     return
    end
    local.get $1
    i32.const 1
    i32.add
    local.set $1
    br $for-loop|0
   end
  end
  i32.const -1
 )
 (func $~lib/rt/stub/__renew (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  local.get $1
  i32.const 1073741804
  i32.gt_u
  if
   i32.const 1056
   i32.const 1120
   i32.const 99
   i32.const 30
   call $~lib/builtins/abort
   unreachable
  end
  local.get $0
  i32.const 16
  i32.sub
  local.tee $0
  i32.const 4
  i32.sub
  local.tee $4
  i32.load
  local.set $3
  global.get $~lib/rt/stub/offset
  local.get $0
  local.get $3
  i32.add
  i32.eq
  local.set $6
  local.get $1
  i32.const 16
  i32.add
  local.tee $2
  i32.const 19
  i32.add
  i32.const -16
  i32.and
  i32.const 4
  i32.sub
  local.set $5
  local.get $2
  local.get $3
  i32.gt_u
  if
   local.get $6
   if
    local.get $2
    i32.const 1073741820
    i32.gt_u
    if
     i32.const 1056
     i32.const 1120
     i32.const 52
     i32.const 33
     call $~lib/builtins/abort
     unreachable
    end
    local.get $0
    local.get $5
    i32.add
    call $~lib/rt/stub/maybeGrowMemory
    local.get $4
    local.get $5
    call $~lib/rt/common/BLOCK#set:mmInfo
   else
    local.get $5
    local.get $3
    i32.const 1
    i32.shl
    local.tee $2
    local.get $2
    local.get $5
    i32.lt_u
    select
    call $~lib/rt/stub/__alloc
    local.tee $2
    local.get $0
    local.get $3
    memory.copy
    local.get $2
    local.set $0
   end
  else
   local.get $6
   if
    local.get $0
    local.get $5
    i32.add
    global.set $~lib/rt/stub/offset
    local.get $4
    local.get $5
    call $~lib/rt/common/BLOCK#set:mmInfo
   end
  end
  local.get $0
  i32.const 4
  i32.sub
  local.get $1
  call $~lib/rt/common/OBJECT#set:rtSize
  local.get $0
  i32.const 16
  i32.add
 )
 (func $~lib/string/String#replaceAll (param $0 i32) (result i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  local.get $0
  call $~lib/string/String#get:length
  local.tee $4
  i32.const 1264
  call $~lib/string/String#get:length
  local.tee $7
  i32.le_u
  if
   local.get $4
   local.get $7
   i32.ge_u
   if (result i32)
    i32.const 1296
    local.get $0
    i32.const 1264
    local.get $0
    call $~lib/string/String.__eq
    select
   else
    local.get $0
   end
   return
  end
  i32.const 1296
  call $~lib/string/String#get:length
  local.set $3
  local.get $7
  i32.eqz
  if
   local.get $3
   i32.eqz
   if
    local.get $0
    return
   end
   local.get $4
   local.get $4
   i32.const 1
   i32.add
   local.get $3
   i32.mul
   i32.add
   i32.const 1
   i32.shl
   i32.const 2
   call $~lib/rt/stub/__new
   local.tee $1
   i32.const 1296
   local.get $3
   i32.const 1
   i32.shl
   memory.copy
   local.get $3
   local.set $2
   loop $for-loop|0
    local.get $4
    local.get $5
    i32.gt_u
    if
     local.get $1
     local.get $2
     i32.const 1
     i32.shl
     i32.add
     local.get $0
     local.get $5
     i32.const 1
     i32.shl
     i32.add
     i32.load16_u
     i32.store16
     local.get $1
     local.get $2
     i32.const 1
     i32.add
     local.tee $2
     i32.const 1
     i32.shl
     i32.add
     i32.const 1296
     local.get $3
     i32.const 1
     i32.shl
     memory.copy
     local.get $2
     local.get $3
     i32.add
     local.set $2
     local.get $5
     i32.const 1
     i32.add
     local.set $5
     br $for-loop|0
    end
   end
   local.get $1
   return
  end
  local.get $3
  local.get $7
  i32.eq
  if
   local.get $4
   i32.const 1
   i32.shl
   local.tee $1
   i32.const 2
   call $~lib/rt/stub/__new
   local.tee $2
   local.get $0
   local.get $1
   memory.copy
   loop $while-continue|1
    local.get $0
    local.get $5
    call $~lib/string/String#indexOf
    local.tee $1
    i32.const -1
    i32.xor
    if
     local.get $2
     local.get $1
     i32.const 1
     i32.shl
     i32.add
     i32.const 1296
     local.get $3
     i32.const 1
     i32.shl
     memory.copy
     local.get $1
     local.get $7
     i32.add
     local.set $5
     br $while-continue|1
    end
   end
   local.get $2
   return
  end
  local.get $4
  local.set $2
  loop $while-continue|2
   local.get $0
   local.get $5
   call $~lib/string/String#indexOf
   local.tee $8
   i32.const -1
   i32.xor
   if
    local.get $1
    if (result i32)
     local.get $1
     call $~lib/string/String#get:length
    else
     i32.const 0
    end
    i32.eqz
    if
     local.get $4
     i32.const 1
     i32.shl
     i32.const 2
     call $~lib/rt/stub/__new
     local.set $1
    end
    local.get $8
    local.get $5
    i32.sub
    local.tee $9
    local.get $6
    i32.add
    local.get $3
    i32.add
    local.get $2
    i32.gt_u
    if
     local.get $1
     local.get $2
     i32.const 1
     i32.shl
     local.tee $2
     i32.const 1
     i32.shl
     call $~lib/rt/stub/__renew
     local.set $1
    end
    local.get $6
    i32.const 1
    i32.shl
    local.get $1
    i32.add
    local.get $0
    local.get $5
    i32.const 1
    i32.shl
    i32.add
    local.get $9
    i32.const 1
    i32.shl
    memory.copy
    local.get $1
    local.get $6
    local.get $9
    i32.add
    local.tee $5
    i32.const 1
    i32.shl
    i32.add
    i32.const 1296
    local.get $3
    i32.const 1
    i32.shl
    memory.copy
    local.get $3
    local.get $5
    i32.add
    local.set $6
    local.get $7
    local.get $8
    i32.add
    local.set $5
    br $while-continue|2
   end
  end
  local.get $1
  if
   local.get $4
   local.get $5
   i32.sub
   local.tee $3
   local.get $6
   i32.add
   local.get $2
   i32.gt_u
   if
    local.get $1
    local.get $2
    i32.const 1
    i32.shl
    local.tee $2
    i32.const 1
    i32.shl
    call $~lib/rt/stub/__renew
    local.set $1
   end
   local.get $3
   if
    local.get $1
    local.get $6
    i32.const 1
    i32.shl
    i32.add
    local.get $0
    local.get $5
    i32.const 1
    i32.shl
    i32.add
    local.get $3
    i32.const 1
    i32.shl
    memory.copy
   end
   local.get $3
   local.get $6
   i32.add
   local.tee $0
   local.get $2
   i32.lt_u
   if (result i32)
    local.get $1
    local.get $0
    i32.const 1
    i32.shl
    call $~lib/rt/stub/__renew
   else
    local.get $1
   end
   return
  end
  local.get $0
 )
 (func $~lib/util/string/isSpace (param $0 i32) (result i32)
  local.get $0
  i32.const 5760
  i32.lt_u
  if
   local.get $0
   i32.const 128
   i32.or
   i32.const 160
   i32.eq
   local.get $0
   i32.const 9
   i32.sub
   i32.const 4
   i32.le_u
   i32.or
   return
  end
  local.get $0
  i32.const -8192
  i32.add
  i32.const 10
  i32.le_u
  if
   i32.const 1
   return
  end
  local.get $0
  i32.const 5760
  i32.eq
  local.get $0
  i32.const 8232
  i32.eq
  i32.or
  local.get $0
  i32.const 8233
  i32.eq
  local.get $0
  i32.const 8239
  i32.eq
  i32.or
  i32.or
  local.get $0
  i32.const 8287
  i32.eq
  local.get $0
  i32.const 12288
  i32.eq
  i32.or
  local.get $0
  i32.const 65279
  i32.eq
  i32.or
  i32.or
  if
   i32.const 1
   return
  end
  i32.const 0
 )
 (func $~lib/string/String#trim (param $0 i32) (result i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  local.get $0
  call $~lib/string/String#get:length
  local.tee $3
  i32.const 1
  i32.shl
  local.set $1
  loop $while-continue|0
   local.get $1
   if (result i32)
    local.get $0
    local.get $1
    i32.add
    i32.const 2
    i32.sub
    i32.load16_u
    call $~lib/util/string/isSpace
   else
    i32.const 0
   end
   if
    local.get $1
    i32.const 2
    i32.sub
    local.set $1
    br $while-continue|0
   end
  end
  loop $while-continue|1
   local.get $1
   local.get $2
   i32.gt_u
   if (result i32)
    local.get $0
    local.get $2
    i32.add
    i32.load16_u
    call $~lib/util/string/isSpace
   else
    i32.const 0
   end
   if
    local.get $2
    i32.const 2
    i32.add
    local.set $2
    local.get $1
    i32.const 2
    i32.sub
    local.set $1
    br $while-continue|1
   end
  end
  local.get $1
  i32.eqz
  if
   i32.const 1184
   return
  end
  local.get $2
  i32.eqz
  local.get $1
  local.get $3
  i32.const 1
  i32.shl
  i32.eq
  i32.and
  if
   local.get $0
   return
  end
  local.get $1
  i32.const 2
  call $~lib/rt/stub/__new
  local.tee $3
  local.get $0
  local.get $2
  i32.add
  local.get $1
  memory.copy
  local.get $3
 )
 (func $assembly/csvParser/extractField (param $0 i32) (param $1 f64) (param $2 f64) (param $3 i32) (result i32)
  local.get $1
  local.get $2
  f64.ge
  if
   i32.const 1184
   return
  end
  local.get $0
  local.get $1
  i32.trunc_sat_f64_s
  local.get $2
  i32.trunc_sat_f64_s
  call $~lib/string/String#substring
  local.tee $0
  call $~lib/string/String#get:length
  i32.const 2
  i32.ge_s
  if (result i32)
   local.get $0
   i32.const 0
   call $~lib/string/String#charCodeAt
   f64.convert_i32_s
   f64.const 34
   f64.eq
  else
   i32.const 0
  end
  if (result i32)
   local.get $0
   local.get $0
   call $~lib/string/String#get:length
   i32.const 1
   i32.sub
   call $~lib/string/String#charCodeAt
   f64.convert_i32_s
   f64.const 34
   f64.eq
  else
   i32.const 0
  end
  if
   local.get $0
   i32.const 1
   local.get $0
   call $~lib/string/String#get:length
   i32.const 1
   i32.sub
   call $~lib/string/String#substring
   call $~lib/string/String#replaceAll
   local.set $0
  end
  local.get $3
  if (result i32)
   local.get $0
   call $~lib/string/String#trim
  else
   local.get $0
  end
 )
 (func $assembly/csvParser/parseNumber (param $0 i32) (result f64)
  (local $1 f64)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 f64)
  (local $6 f64)
  (local $7 i32)
  local.get $0
  call $~lib/string/String#get:length
  i32.eqz
  if
   f64.const nan:0x8000000000000
   return
  end
  local.get $0
  call $~lib/string/String#trim
  local.tee $3
  call $~lib/string/String#get:length
  i32.eqz
  if
   f64.const nan:0x8000000000000
   return
  end
  local.get $3
  i32.const 0
  call $~lib/string/String#charCodeAt
  i32.const 45
  i32.eq
  if (result i32)
   i32.const 1
   local.set $7
   i32.const 1
  else
   i32.const 0
  end
  local.set $0
  f64.const 1
  local.set $1
  loop $while-continue|0
   local.get $3
   call $~lib/string/String#get:length
   local.get $0
   i32.gt_s
   if
    local.get $3
    local.get $0
    call $~lib/string/String#charCodeAt
    local.tee $2
    i32.const 57
    i32.le_s
    local.get $2
    i32.const 48
    i32.ge_s
    i32.and
    if
     local.get $4
     if
      local.get $1
      f64.const 10
      f64.mul
      local.set $1
      local.get $6
      f64.const 10
      f64.mul
      local.get $2
      i32.const 48
      i32.sub
      f64.convert_i32_s
      f64.add
      local.set $6
     else
      local.get $5
      f64.const 10
      f64.mul
      local.get $2
      i32.const 48
      i32.sub
      f64.convert_i32_s
      f64.add
      local.set $5
     end
    else
     local.get $2
     i32.const 46
     i32.eq
     if
      local.get $4
      if
       f64.const nan:0x8000000000000
       return
      end
     else
      f64.const nan:0x8000000000000
      return
     end
     i32.const 1
     local.set $4
    end
    local.get $0
    i32.const 1
    i32.add
    local.set $0
    br $while-continue|0
   end
  end
  local.get $5
  local.get $6
  local.get $1
  f64.div
  f64.add
  local.get $5
  local.get $4
  select
  local.tee $1
  f64.neg
  local.get $1
  local.get $7
  select
 )
 (func $assembly/csvParser/detectFieldType (param $0 i32) (result f64)
  (local $1 f64)
  local.get $0
  call $~lib/string/String#get:length
  if (result i32)
   local.get $0
   i32.const 1328
   call $~lib/string/String.__eq
  else
   i32.const 1
  end
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.const 1360
   call $~lib/string/String.__eq
  end
  if
   f64.const 3
   return
  end
  local.get $0
  i32.const 1392
  call $~lib/string/String.__eq
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.const 1424
   call $~lib/string/String.__eq
  end
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.const 1456
   call $~lib/string/String.__eq
  end
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.const 1488
   call $~lib/string/String.__eq
  end
  if
   f64.const 2
   return
  end
  local.get $0
  call $assembly/csvParser/parseNumber
  local.tee $1
  local.get $1
  f64.eq
  if
   f64.const 1
   return
  end
  f64.const 0
 )
 (func $assembly/csvParser/estimateMemory (param $0 f64) (param $1 f64) (result f64)
  local.get $0
  local.get $1
  f64.mul
  f64.const 64
  f64.mul
 )
 (func $assembly/csvParser/initialize
  call $assembly/csvParser/CSVResult#constructor
  global.set $assembly/csvParser/lastResult
 )
 (func $assembly/csvParser/getVersion (result i32)
  i32.const 1520
 )
 (func $assembly/csvParser/benchmark (param $0 i32) (result f64)
  i32.const 1
  global.set $~argumentsLength
  local.get $0
  f64.const 0
  i32.const 1
  i32.const 1
  call $assembly/csvParser/parseCSVChunk@varargs
  drop
  global.get $assembly/csvParser/lastResult
  f64.load
  f64.const 0.001
  f64.mul
 )
 (func $~lib/rt/stub/__pin (param $0 i32) (result i32)
  local.get $0
 )
 (func $~lib/rt/stub/__unpin (param $0 i32)
 )
 (func $~lib/rt/stub/__collect
 )
 (func $~setArgumentsLength (param $0 i32)
  local.get $0
  global.set $~argumentsLength
 )
 (func $~start
  i32.const 1564
  global.set $~lib/rt/stub/offset
  call $assembly/csvParser/CSVResult#constructor
  global.set $assembly/csvParser/lastResult
 )
)
