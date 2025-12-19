import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Edit2, Play, Pause, RotateCcw, Coffee, Droplets, Clock, X, Save } from 'lucide-react';

// --- StepModal Component (Extracted outside of App) ---
// モーダルをAppの外に出すことで、Appの再レンダリング時にモーダルが再生成されるのを防ぎます。
// これによりスライダーの操作が滑らかになります。
const StepModal = ({ 
  isOpen, 
  step, 
  onClose, 
  onSave, 
  onDelete, 
  onUpdate, 
  isExistingStep 
}) => {
  if (!isOpen || !step) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#4a403a]/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#f8f5f0] w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#edeae6] p-4 border-b border-[#dcd6d0] flex justify-between items-center">
          <h3 className="font-bold text-[#4a403a] text-lg">工程の設定</h3>
          <button onClick={onClose} className="text-[#8c7b70] hover:text-[#4a403a]">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-8">
          
          {/* Step Name */}
          <div>
            <label className="block text-xs font-bold text-[#8c7b70] uppercase tracking-wide mb-1">工程名</label>
            <input 
              type="text" 
              value={step.name} 
              onChange={(e) => onUpdate({...step, name: e.target.value})}
              className="w-full text-xl font-bold border-b-2 border-[#dcd6d0] focus:border-[#9c6644] outline-none py-2 bg-transparent text-[#4a403a] placeholder-[#dcd6d0]"
              placeholder="例: 1湯目"
            />
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Water Amount Input - Slider Version */}
            <div className="bg-[#e0f0f0] p-5 rounded-xl border border-[#c0e0e0]">
              <div className="flex justify-between items-center mb-2">
                <label className="flex items-center gap-1 text-sm font-bold text-[#5c8a8a]">
                  <Droplets size={18} /> 湯量 (ml)
                </label>
                {/* 数値表示（手入力も可能） */}
                <div className="flex items-baseline gap-1">
                  <input 
                    type="number"
                    min="0"
                    value={step.water} 
                    onChange={(e) => onUpdate({...step, water: e.target.value === '' ? '' : Number(e.target.value)})}
                    className="w-20 text-right text-3xl font-bold bg-transparent border-b border-transparent focus:border-[#5c8a8a] outline-none text-[#4a403a]"
                  />
                  <span className="text-sm font-bold text-[#5c8a8a]">ml</span>
                </div>
              </div>
              
              {/* Slider */}
              <input 
                type="range" 
                min="0" max="300" 
                step="1" 
                value={step.water} 
                onChange={(e) => onUpdate({...step, water: Number(e.target.value)})}
                className="w-full h-3 bg-[#c0e0e0] rounded-lg appearance-none cursor-pointer accent-[#5c8a8a]"
              />
              <div className="flex justify-between text-[10px] text-[#5c8a8a]/70 font-bold mt-1 px-1">
                <span>0</span>
                <span>150</span>
                <span>300</span>
              </div>
            </div>

            {/* Time Input - Slider Version */}
            <div className="bg-[#f0e6d2] p-5 rounded-xl border border-[#e0d0b0]">
              <div className="flex justify-between items-center mb-2">
                <label className="flex items-center gap-1 text-sm font-bold text-[#9c6644]">
                  <Clock size={18} /> 時間 (秒)
                </label>
                {/* 数値表示（手入力も可能） */}
                <div className="flex items-baseline gap-1">
                  <input 
                    type="number" 
                    min="0"
                    value={step.time} 
                    onChange={(e) => onUpdate({...step, time: e.target.value === '' ? '' : Number(e.target.value)})}
                    className="w-20 text-right text-3xl font-bold bg-transparent border-b border-transparent focus:border-[#9c6644] outline-none text-[#4a403a]"
                  />
                  <span className="text-sm font-bold text-[#9c6644]">sec</span>
                </div>
              </div>

              {/* Slider */}
              <input 
                type="range" 
                min="0" max="180" 
                step="1" 
                value={step.time} 
                onChange={(e) => onUpdate({...step, time: Number(e.target.value)})}
                className="w-full h-3 bg-[#e0d0b0] rounded-lg appearance-none cursor-pointer accent-[#9c6644]"
              />
               <div className="flex justify-between text-[10px] text-[#9c6644]/70 font-bold mt-1 px-1">
                <span>0</span>
                <span>90</span>
                <span>180</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[#8c7b70] uppercase tracking-wide mb-1">メモ・コツ</label>
            <textarea 
              value={step.description}
              onChange={(e) => onUpdate({...step, description: e.target.value})}
              className="w-full bg-[#edeae6] rounded-xl p-4 text-sm text-[#4a403a] focus:ring-2 focus:ring-[#9c6644] outline-none resize-none h-24"
              placeholder="例: 円を描くように優しく注ぐ..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#edeae6] p-4 border-t border-[#dcd6d0] flex gap-3">
           {isExistingStep && (
            <button 
              onClick={() => onDelete(step.id)}
              className="p-3 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
            >
              <Trash2 size={20} />
            </button>
          )}
          <button 
            onClick={onSave}
            className="flex-1 bg-[#6b5143] text-[#f8f5f0] rounded-xl font-bold py-3 hover:bg-[#5a4236] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#6b5143]/20"
          >
            <Save size={18} /> 保存する
          </button>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  // --- State ---
  // 基本設定
  const [coffeeGrams, setCoffeeGrams] = useState(15); // 豆の量 (g)
  const [ratio, setRatio] = useState(16); // 比率 (1:16)
  
  // 工程リスト
  const [steps, setSteps] = useState([
    { id: 1, type: 'bloom', name: '蒸らし', water: 30, time: 30, description: '全体を湿らせてガスを抜く' },
    { id: 2, type: 'pour', name: '1湯目', water: 90, time: 30, description: '中心から円を描くように' },
    { id: 3, type: 'pour', name: '2湯目', water: 120, time: 45, description: '水位を保ちながら注ぐ' },
  ]);

  // UI State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState(null); // nullなら新規追加
  const [mode, setMode] = useState('build'); // 'build' | 'timer'
  
  // Timer State
  const [timerActive, setTimerActive] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // --- Calculations ---
  const targetWater = Math.round(coffeeGrams * ratio);
  
  const totalWaterScheduled = useMemo(() => 
    steps.reduce((acc, step) => acc + Number(step.water), 0), 
  [steps]);

  const totalTimeScheduled = useMemo(() => 
    steps.reduce((acc, step) => acc + Number(step.time), 0), 
  [steps]);

  // --- Handlers ---

  // モーダル操作
  const openAddModal = () => {
    setEditingStep({
      id: Date.now(),
      type: 'pour',
      name: `注湯 ${steps.filter(s => s.type === 'pour').length + 1}`,
      water: 50,
      time: 30,
      description: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (step) => {
    setEditingStep({ ...step });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStep(null);
  };

  const saveStep = () => {
    if (!editingStep) return;

    // 数値型に確実に変換して保存（空文字の場合は0）
    const stepToSave = {
      ...editingStep,
      water: Number(editingStep.water),
      time: Number(editingStep.time)
    };

    if (steps.find(s => s.id === stepToSave.id)) {
      // 編集
      setSteps(steps.map(s => s.id === stepToSave.id ? stepToSave : s));
    } else {
      // 新規
      setSteps([...steps, stepToSave]);
    }
    closeModal();
  };

  const deleteStep = (id) => {
    setSteps(steps.filter(s => s.id !== id));
    closeModal();
  };

  // プリセット追加ヘルパー
  const setPreset = (type) => {
    if (type === 'default') {
      // Default (Initial State)
      setCoffeeGrams(15);
      setRatio(16);
      setSteps([
        { id: 1, type: 'bloom', name: '蒸らし', water: 30, time: 30, description: '全体を湿らせてガスを抜く' },
        { id: 2, type: 'pour', name: '1湯目', water: 90, time: 30, description: '中心から円を描くように' },
        { id: 3, type: 'pour', name: '2湯目', water: 120, time: 45, description: '水位を保ちながら注ぐ' },
      ]);
    }
  };

  // --- Timer Logic ---
  useEffect(() => {
    let interval = null;
    if (timerActive) {
      interval = setInterval(() => {
        setCurrentTime((prev) => prev + 1);
      }, 1000);
    } else if (!timerActive && currentTime !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive, currentTime]);

  // 現在のステップ判定
  useEffect(() => {
    let accumulatedTime = 0;
    let foundIndex = -1;
    
    for (let i = 0; i < steps.length; i++) {
      if (currentTime >= accumulatedTime && currentTime < accumulatedTime + steps[i].time) {
        foundIndex = i;
        break;
      }
      accumulatedTime += steps[i].time;
    }
    
    if (foundIndex !== -1) {
      setCurrentStepIndex(foundIndex);
    } else if (currentTime >= totalTimeScheduled) {
      setCurrentStepIndex(steps.length); // 終了
      setTimerActive(false);
    }
  }, [currentTime, steps, totalTimeScheduled]);

  const toggleTimer = () => setTimerActive(!timerActive);
  const resetTimer = () => {
    setTimerActive(false);
    setCurrentTime(0);
    setCurrentStepIndex(0);
  };

  // タイマー画面
  if (mode === 'timer') {
    const activeStep = steps[currentStepIndex];
    const isFinished = currentStepIndex >= steps.length;

    const previousWater = steps.slice(0, currentStepIndex).reduce((acc, s) => acc + Number(s.water), 0);
    const currentStepTargetWater = previousWater + (activeStep ? Number(activeStep.water) : 0);

    return (
      <div className="min-h-screen bg-[#2a2420] text-[#f8f5f0] flex flex-col relative overflow-hidden">
        {/* Timer Header */}
        <div className="flex justify-between items-center p-6 z-10">
          <button onClick={() => setMode('build')} className="text-[#8c7b70] hover:text-[#f8f5f0] transition-colors">
            <X size={24} /> 戻る
          </button>
          <div className="text-sm font-mono text-[#8c7b70]">Total: {totalWaterScheduled}ml</div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center z-10 p-6 text-center space-y-8">
          
          {isFinished ? (
            <div className="animate-in zoom-in duration-300">
              <Coffee size={80} className="text-[#9c6644] mx-auto mb-4" />
              <h2 className="text-4xl font-bold mb-2">抽出完了</h2>
              <p className="text-[#8c7b70]">美味しいコーヒーを楽しみましょう</p>
            </div>
          ) : (
            <>
              {/* Step Info */}
              <div className="space-y-3">
                <span className="inline-block px-4 py-1.5 rounded-full bg-[#9c6644]/20 text-[#9c6644] text-sm font-bold tracking-wider uppercase mb-2 border border-[#9c6644]/30">
                  Step {currentStepIndex + 1} / {steps.length}
                </span>
                <h2 className="text-4xl font-bold text-[#f8f5f0]">{activeStep?.name}</h2>
                <p className="text-[#dcd6d0] max-w-xs mx-auto text-base min-h-[1.5rem]">
                  {activeStep?.description}
                </p>
              </div>

              {/* Big Timer */}
              <div className="font-mono text-[7rem] font-bold tracking-tighter tabular-nums my-2 text-[#f8f5f0]">
                {Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')}
              </div>

              {/* Water Target for this step */}
              <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-[#3a322e] border border-[#4a403a]">
                <div className="text-[#8c7b70] text-sm uppercase tracking-widest">Target Pour</div>
                <div className="text-5xl font-bold text-[#5c8a8a] flex items-center gap-2">
                  <Droplets size={32} className="fill-[#5c8a8a]/20" />
                  {currentStepTargetWater}<span className="text-2xl">ml</span>
                </div>
                <div className="text-[#8c7b70] text-sm">
                  (今回: {activeStep?.water}ml)
                </div>
              </div>
            </>
          )}

        </div>

        {/* Controls */}
        <div className="p-10 pb-16 flex justify-center gap-8 z-10 bg-gradient-to-t from-[#2a2420] via-[#2a2420] to-transparent">
          <button 
            onClick={resetTimer} 
            className="w-16 h-16 rounded-full bg-[#3a322e] text-[#8c7b70] flex items-center justify-center hover:bg-[#4a403a] transition-colors border border-[#4a403a]"
          >
            <RotateCcw size={24} />
          </button>
          
          {!isFinished && (
            <button 
              onClick={toggleTimer} 
              className={`w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-all transform active:scale-95 ${
                timerActive 
                  ? 'bg-[#9c6644] text-[#f8f5f0] shadow-[#9c6644]/30' 
                  : 'bg-[#f8f5f0] text-[#2a2420] shadow-[#f8f5f0]/10'
              }`}
            >
              {timerActive ? <Pause size={40} className="fill-current" /> : <Play size={40} className="fill-current ml-1" />}
            </button>
          )}
        </div>
      </div>
    );
  }

  // --- Main Build View ---
  return (
    <div className="min-h-screen bg-[#f8f5f0] text-[#4a403a] font-sans pb-28 md:pb-0 relative">
      <StepModal 
        isOpen={isModalOpen} 
        step={editingStep} 
        onClose={closeModal} 
        onSave={saveStep}
        onDelete={deleteStep}
        onUpdate={setEditingStep}
        isExistingStep={steps.find(s => s.id === editingStep?.id)}
      />

      {/* Header Area */}
      <header className="bg-[#f8f5f0]/80 backdrop-blur-md border-b border-[#dcd6d0] sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold flex items-center gap-2 text-[#4a403a]">
            <Coffee className="text-[#9c6644]" size={24} />
            Recipe Builder
          </h1>
          <button 
            onClick={() => setPreset('default')}
            className="text-xs font-bold text-[#6b5143] bg-[#edeae6] px-4 py-2 rounded-full hover:bg-[#dcd6d0] transition-colors"
          >
            デフォルトに戻す
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        
        {/* Settings Card */}
        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-[#6b5143]/5 border border-[#edeae6] space-y-6">
          {/* Coffee Beans */}
          <div>
            <div className="flex justify-between items-end mb-3">
              <label className="text-sm font-bold text-[#8c7b70] uppercase flex items-center gap-1">
                <Coffee size={18} /> 豆の量 (g)
              </label>
              <span className="text-3xl font-bold text-[#4a403a]">{coffeeGrams}<span className="text-lg ml-1">g</span></span>
            </div>
            <input 
              type="range" 
              min="8" max="40" step="1" 
              value={coffeeGrams} 
              onChange={(e) => setCoffeeGrams(Number(e.target.value))}
              className="w-full h-3 bg-[#edeae6] rounded-lg appearance-none cursor-pointer accent-[#9c6644]"
            />
          </div>

          {/* Ratio */}
          <div>
            <div className="flex justify-between items-end mb-3">
              <label className="text-sm font-bold text-[#8c7b70] uppercase flex items-center gap-1">
                <Droplets size={18} /> 比率 (1:x)
              </label>
              <span className="text-3xl font-bold text-[#4a403a]">1:{ratio}</span>
            </div>
            <input 
              type="range" 
              min="10" max="20" step="0.5" 
              value={ratio} 
              onChange={(e) => setRatio(Number(e.target.value))}
              className="w-full h-3 bg-[#edeae6] rounded-lg appearance-none cursor-pointer accent-[#9c6644]"
            />
          </div>

          <hr className="border-[#edeae6]" />

          {/* Result Summary */}
          <div className="flex justify-between items-end">
             <div>
                <p className="text-xs text-[#8c7b70] font-bold uppercase mb-1">目標湯量</p>
                <p className="text-4xl font-bold text-[#4a403a]">{targetWater}<span className="text-xl text-[#8c7b70] ml-1">ml</span></p>
             </div>
             <div className="text-right pb-1">
                <p className="text-xs text-[#8c7b70] font-bold uppercase mb-1">現在設定中</p>
                <p className={`text-2xl font-bold ${totalWaterScheduled > targetWater ? 'text-red-500' : 'text-[#5c8a8a]'}`}>
                  {totalWaterScheduled}<span className="text-base text-[#8c7b70] ml-1">ml</span>
                </p>
             </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-[#edeae6] rounded-full h-3 overflow-hidden">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${totalWaterScheduled > targetWater ? 'bg-red-400' : 'bg-[#5c8a8a]'}`} 
              style={{ width: `${Math.min((totalWaterScheduled / targetWater) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Steps List */}
        <div>
          <div className="flex justify-between items-center mb-4 px-2">
            <h2 className="text-xl font-bold text-[#4a403a]">抽出ステップ</h2>
            <span className="text-sm font-bold font-mono bg-[#edeae6] text-[#6b5143] px-3 py-1.5 rounded-lg">
              Total: {Math.floor(totalTimeScheduled / 60)}:{(totalTimeScheduled % 60).toString().padStart(2, '0')}
            </span>
          </div>
          
          <div className="space-y-4">
            {steps.map((step, index) => {
               const prevWater = steps.slice(0, index).reduce((sum, s) => sum + Number(s.water), 0);
               const stepEndWater = prevWater + Number(step.water);

               return (
                <div 
                  key={step.id} 
                  onClick={() => openEditModal(step)}
                  className="bg-white p-5 rounded-2xl border border-[#edeae6] shadow-sm active:scale-[0.98] transition-all cursor-pointer flex justify-between items-center group relative overflow-hidden hover:shadow-md hover:border-[#dcd6d0]"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#9c6644] opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="bg-[#edeae6] text-[#8c7b70] text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full">
                        {index + 1}
                      </span>
                      <h3 className="text-lg font-bold text-[#4a403a]">{step.name}</h3>
                    </div>
                    <p className="text-sm text-[#8c7b70] line-clamp-1 ml-10">{step.description || 'メモなし'}</p>
                  </div>

                  <div className="flex items-center gap-5 text-right">
                    <div>
                      <div className="text-base font-bold text-[#5c8a8a] flex items-center justify-end gap-1">
                        {step.water}ml
                        <span className="text-xs text-[#8c7b70] font-normal">({stepEndWater}ml)</span>
                      </div>
                      <div className="text-sm font-bold text-[#9c6644] flex items-center justify-end gap-1 mt-0.5">
                        <Clock size={12} /> {step.time}s
                      </div>
                    </div>
                    <Edit2 size={18} className="text-[#dcd6d0] group-hover:text-[#9c6644] transition-colors" />
                  </div>
                </div>
              );
            })}

            {/* Add Button */}
            <button 
              onClick={openAddModal}
              className="w-full py-5 border-2 border-dashed border-[#dcd6d0] rounded-2xl text-[#8c7b70] font-bold hover:bg-[#edeae6] hover:border-[#c0b0a0] hover:text-[#6b5143] transition-all flex items-center justify-center gap-2"
            >
              <Plus size={22} /> 工程を追加
            </button>
          </div>
        </div>
      </main>

      {/* Floating Action Button for Timer */}
      <div className="fixed bottom-8 right-8 md:absolute md:bottom-8 md:right-8">
        <button 
          onClick={() => setMode('timer')}
          className="bg-[#6b5143] text-[#f8f5f0] p-4 rounded-full shadow-xl shadow-[#6b5143]/40 hover:bg-[#5a4236] hover:scale-105 transition-all flex items-center gap-3 pr-8"
        >
          <div className="bg-[#f8f5f0] text-[#6b5143] rounded-full p-3">
            <Play size={24} className="ml-0.5" />
          </div>
          <span className="font-bold text-lg">タイマー開始</span>
        </button>
      </div>
    </div>
  );
};

export default App;