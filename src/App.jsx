import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Plus, Trash2, Edit2, Play, Pause, RotateCcw, Coffee, Droplets, Clock, X, Save, Volume2, VolumeX, ChevronRight, ChevronDown, ChevronUp, Settings, SkipForward } from 'lucide-react';

// --- Audio Engine ---
// 音声再生をより確実にするためのクラス
class AudioEngine {
  constructor() {
    this.ctx = null;
    this.gainNode = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
        this.gainNode = this.ctx.createGain();
        this.gainNode.connect(this.ctx.destination);
      }
    }
    return this.ctx;
  }

  async resume() {
    if (this.init() && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  playTone(freq, duration, volume) {
    if (!this.ctx || volume <= 0) return;
    
    // 念のため再開を試みる
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    const osc = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain(); // 個別の音用ゲイン

    osc.connect(noteGain);
    noteGain.connect(this.ctx.destination);

    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    osc.type = 'sine';

    const now = this.ctx.currentTime;
    
    // クリックノイズ防止のエンベロープ
    noteGain.gain.setValueAtTime(0, now);
    noteGain.gain.linearRampToValueAtTime(volume, now + 0.05);
    noteGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.start(now);
    osc.stop(now + duration + 0.1);
    
    // ガベージコレクション対策で少し後に切断
    setTimeout(() => {
      osc.disconnect();
      noteGain.disconnect();
    }, (duration + 0.2) * 1000);
  }
}

// シングルトンインスタンス
const audioEngine = new AudioEngine();

// --- StepModal Component ---
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
          <h3 className="font-bold text-[#4a403a] text-lg">ステップの設定</h3>
          <button onClick={onClose} className="text-[#8c7b70] hover:text-[#4a403a]">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-8">
          
          {/* Step Name */}
          <div>
            <label className="block text-xs font-bold text-[#8c7b70] uppercase tracking-wide mb-1">ステップ名</label>
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
                {/* 数値表示 */}
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
                value={Number(step.water) || 0} 
                onChange={(e) => onUpdate({...step, water: Number(e.target.value)})}
                className="w-full h-3 bg-[#c0e0e0] rounded-lg appearance-none cursor-pointer accent-[#5c8a8a]"
              />
            </div>

            {/* Time Input - Slider Version */}
            <div className="bg-[#f0e6d2] p-5 rounded-xl border border-[#e0d0b0]">
              <div className="flex justify-between items-center mb-2">
                <label className="flex items-center gap-1 text-sm font-bold text-[#9c6644]">
                  <Clock size={18} /> 時間 (秒)
                </label>
                {/* 数値表示 */}
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
                value={Number(step.time) || 0} 
                onChange={(e) => onUpdate({...step, time: Number(e.target.value)})}
                className="w-full h-3 bg-[#e0d0b0] rounded-lg appearance-none cursor-pointer accent-[#9c6644]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[#8c7b70] uppercase tracking-wide mb-1">メモ・コツ</label>
            <textarea 
              value={step.description}
              onChange={(e) => onUpdate({...step, description: e.target.value})}
              className="w-full bg-[#edeae6] rounded-xl p-4 text-sm text-[#4a403a] focus:ring-2 focus:ring-[#9c6644] outline-none resize-none h-24"
              placeholder="例: 円を描くように優しく注ぐ"
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
  const [coffeeGrams, setCoffeeGrams] = useState(15);
  const [ratio, setRatio] = useState(16);
  
  const [steps, setSteps] = useState([
    { id: 1, type: 'bloom', name: '蒸らし', water: 30, time: 30, description: '全体にお湯を注ぎガスを抜く' },
    { id: 2, type: 'pour', name: 'ステップ1', water: 90, time: 30, description: '' },
    { id: 3, type: 'pour', name: 'ステップ2', water: 120, time: 45, description: '' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState(null);
  
  // Timer Modes: 'build' | 'timer'
  const [mode, setMode] = useState('build');
  const [volume, setVolume] = useState(0.5);
  const [isTimerHeaderExpanded, setIsTimerHeaderExpanded] = useState(false);
  
  // Timer Logic State
  const [timerActive, setTimerActive] = useState(false);
  const [currentTime, setCurrentTime] = useState(0); // 抽出経過時間
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  // Countdown (Preparation) State
  const [isPreparing, setIsPreparing] = useState(false);
  const [countdownTime, setCountdownTime] = useState(10); // 準備時間10秒

  // --- Audio ---
  const playSound = (freq, duration) => {
    audioEngine.playTone(freq, duration, volume);
  };

  const handleStartAudio = async () => {
    await audioEngine.resume();
  };

  // --- Calculations ---
  const targetWater = Math.round(coffeeGrams * ratio);
  
  const totalWaterScheduled = useMemo(() => 
    steps.reduce((acc, step) => acc + Number(step.water), 0), 
  [steps]);

  const totalTimeScheduled = useMemo(() => 
    steps.reduce((acc, step) => acc + Number(step.time), 0), 
  [steps]);

  // --- Handlers ---
  const openAddModal = () => {
    setEditingStep({
      id: Date.now(),
      type: 'pour',
      name: `ステップ ${steps.filter(s => s.type === 'pour').length + 1}`,
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
    const stepToSave = {
      ...editingStep,
      water: Number(editingStep.water),
      time: Number(editingStep.time)
    };
    if (steps.find(s => s.id === stepToSave.id)) {
      setSteps(steps.map(s => s.id === stepToSave.id ? stepToSave : s));
    } else {
      setSteps([...steps, stepToSave]);
    }
    closeModal();
  };

  const deleteStep = (id) => {
    setSteps(steps.filter(s => s.id !== id));
    closeModal();
  };

  const setPreset = (type) => {
    if (type === 'default') {
      setCoffeeGrams(15);
      setRatio(16);
      setSteps([
        { id: 1, type: 'bloom', name: '蒸らし', water: 30, time: 30, description: '全体にお湯を注ぐ' },
        { id: 2, type: 'pour', name: 'ステップ1', water: 90, time: 30, description: '' },
        { id: 3, type: 'pour', name: 'ステップ2', water: 120, time: 45, description: '' },
      ]);
    }
  };

  // --- Timer Logic ---
  useEffect(() => {
    let interval = null;

    if (timerActive) {
      interval = setInterval(() => {
        if (isPreparing) {
          // 準備カウントダウン中
          setCountdownTime((prev) => {
            const next = prev - 1;
            // カウントダウン音 (3, 2, 1)
            if (next <= 10 && next > 0) {
              playSound(880, 0.1);
            }
            if (next === 0) {
              // 準備完了 -> 本番スタート
              playSound(1760, 0.4); // スタート音
              setIsPreparing(false);
              return 0;
            }
            return next;
          });
        } else {
          // 本番抽出タイマー進行中
          setCurrentTime((prev) => prev + 1);
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [timerActive, isPreparing]);

  // ステップ進行管理 (本番タイマー動作中のみ)
  useEffect(() => {
    if (isPreparing) return; // 準備中はステップ計算しない

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
      setCurrentStepIndex(steps.length);
      setTimerActive(false);
      playSound(1760, 0.4); // 終了音
    }

    const currentIndexToCheck = foundIndex !== -1 ? foundIndex : steps.length;
    
    if (timerActive && !isPreparing && currentIndexToCheck < steps.length) {
      const prevTime = steps.slice(0, currentIndexToCheck).reduce((acc, s) => acc + s.time, 0);
      const stepEndTime = prevTime + steps[currentIndexToCheck].time;
      const remaining = stepEndTime - currentTime;

      // カウントダウン音 (3, 2, 1)
      if (remaining <= 10 && remaining > 0) {
        playSound(880, 0.1);
      }
      // 切り替わり音
      if (remaining === 0) {
        playSound(1760, 0.3);
      }
    }

  }, [currentTime, steps, totalTimeScheduled, timerActive, isPreparing]);

  const toggleTimer = () => {
    if (!timerActive) {
      handleStartAudio();
      // 初回スタート時（currentTimeが0のとき）は準備モードから開始
      if (currentTime === 0 && countdownTime > 0) {
         setIsPreparing(true);
      }
      // スタート時はヘッダーを閉じる
      setIsTimerHeaderExpanded(false);
    }
    setTimerActive(!timerActive);
  };

  const skipPreparation = () => {
    setIsPreparing(false);
    setCountdownTime(0);
    playSound(1760, 0.4); // スタート音
  };

  const resetTimer = () => {
    setTimerActive(false);
    setCurrentTime(0);
    setCurrentStepIndex(0);
    setIsPreparing(false);
    setCountdownTime(10);
  };

  // --- Timer View Render ---
  if (mode === 'timer') {
    const activeStep = steps[currentStepIndex];
    const isFinished = currentStepIndex >= steps.length;

    // 表示用データの計算
    let progress = 0;
    let remainingTimeDisplay = 0;
    let mainDisplayText = "";
    let subDisplayText = "";

    if (isPreparing) {
      // 準備中モード
      const maxPrep = 10;
      progress = Math.min(Math.max((maxPrep - countdownTime) / maxPrep, 0), 1);
      remainingTimeDisplay = countdownTime;
      mainDisplayText = countdownTime.toString();
      subDisplayText = "準備中";
    } else if (!isFinished) {
      // 通常抽出モード
      const previousStepsTime = steps.slice(0, currentStepIndex).reduce((acc, s) => acc + Number(s.time), 0);
      const currentStepEndTime = previousStepsTime + (activeStep ? Number(activeStep.time) : 0);
      const remaining = Math.max(0, currentStepEndTime - currentTime);
      const stepDuration = activeStep ? activeStep.time : 1;
      
      progress = activeStep 
        ? Math.min(Math.max((stepDuration - remaining) / stepDuration, 0), 1)
        : 0;
      
      remainingTimeDisplay = remaining;
      mainDisplayText = remaining.toString();
      subDisplayText = "残り時間";
    }

    // SVGの設定：ViewBox内で固定座標を使うことでアニメーションを正確にする
    const radius = 120; 
    const circumference = 2 * Math.PI * radius;
    // 完全に閉じるために係数なしで計算
    const strokeDashoffset = circumference - (progress * circumference);

    const previousWater = steps.slice(0, currentStepIndex).reduce((acc, s) => acc + Number(s.water), 0);
    const currentStepTargetWater = previousWater + (activeStep ? Number(activeStep.water) : 0);
    
    const nextStep = steps[currentStepIndex + 1];

    return (
      // 100dvh (Dynamic Viewport Height) を使用してスマホのアドレスバーによる崩れを防止
      // overscroll-none でPull-to-refreshを防止
      <div className="fixed inset-0 z-50 bg-[#2a2420] text-[#f8f5f0] flex flex-col h-[100dvh] touch-manipulation overscroll-none">
        
        {/* --- Collapsible Header (Controls) --- */}
        <div 
          className={`flex-none bg-[#3a322e] transition-all duration-300 ease-in-out border-b border-[#4a403a] z-30 shadow-xl overflow-hidden flex flex-col`}
        >
           {/* Header Toggle Bar (Always Visible) */}
           <div 
             onClick={() => setIsTimerHeaderExpanded(!isTimerHeaderExpanded)}
             className="w-full p-4 flex justify-between items-center cursor-pointer active:bg-[#4a403a]/50 transition-colors"
           >
             <div className="flex gap-6">
                <div className="flex flex-col">
                  <span className="text-[9px] text-[#8c7b70] font-bold tracking-widest uppercase">Total Time</span>
                  <span className="font-mono font-bold text-xl leading-none tracking-tight">
                    {Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                {!isPreparing && (
                  <div className="flex flex-col">
                    <span className="text-[9px] text-[#8c7b70] font-bold tracking-widest uppercase">Total Water</span>
                    <span className="font-mono font-bold text-xl leading-none tracking-tight text-[#5c8a8a]">
                      {totalWaterScheduled}ml
                    </span>
                  </div>
                )}
             </div>
             
             {/* ヘッダーが閉じているときに、動作状況を示すアイコンを表示 */}
             <div className="flex items-center gap-3">
                {!isTimerHeaderExpanded && (
                   <span className="text-xs font-bold text-[#8c7b70] bg-[#2a2420] px-2 py-1 rounded-md border border-[#4a403a]">
                     {isPreparing ? "準備中" : timerActive ? "抽出中" : isFinished ? "完了" : "停止中"}
                   </span>
                )}
                <div className="bg-[#2a2420] p-2 rounded-full border border-[#4a403a] text-[#8c7b70]">
                    {isTimerHeaderExpanded ? <ChevronUp size={20} /> : <Settings size={20} />}
                </div>
             </div>
           </div>

           {/* Expanded Content (Settings & Controls) */}
           <div className={`transition-all duration-300 ease-in-out px-4 bg-[#352d29] ${isTimerHeaderExpanded ? 'max-h-80 opacity-100 pb-6' : 'max-h-0 opacity-0 pb-0'}`}>
              <div className="border-t border-[#4a403a] pt-4 space-y-5">
                 
                 {/* Main Controls inside Header */}
                 <div className="grid grid-cols-2 gap-3">
                    {!isFinished && (
                      <button 
                        onClick={toggleTimer}
                        className={`col-span-2 py-4 rounded-xl font-bold flex items-center justify-center gap-3 text-lg transition-all shadow-lg ${
                          timerActive 
                            ? 'bg-[#2a2420] text-[#9c6644] border border-[#9c6644]' 
                            : 'bg-[#9c6644] text-[#f8f5f0] hover:bg-[#8a5a3a]'
                        }`}
                      >
                        {timerActive ? (
                          <><Pause size={24} className="fill-current" /> 一時停止</>
                        ) : (
                          <><Play size={24} className="fill-current" /> {currentTime === 0 && countdownTime === 10 ? "タイマー開始" : "再開"}</>
                        )}
                      </button>
                    )}

                   <button 
                      onClick={() => {
                        resetTimer();
                      }} 
                      className="bg-[#2a2420] hover:bg-[#4a403a] text-[#dcd6d0] py-3 rounded-xl font-bold flex items-center justify-center gap-2 border border-[#4a403a] transition-colors"
                    >
                      <RotateCcw size={18} /> リセット
                    </button>
                    <button 
                      onClick={() => setMode('build')} 
                      className="bg-[#2a2420] hover:bg-[#4a403a] text-[#dcd6d0] py-3 rounded-xl font-bold flex items-center justify-center gap-2 border border-[#4a403a] transition-colors"
                    >
                      <X size={18} /> 終了する
                    </button>
                 </div>

                 {/* Volume Control */}
                 <div className="flex items-center gap-3 bg-[#2a2420] p-3 rounded-xl border border-[#4a403a]">
                    <button 
                       onClick={() => setVolume(v => v === 0 ? 0.5 : 0)} 
                       className={`p-2 rounded-lg ${volume === 0 ? 'bg-red-500/20 text-red-400' : 'bg-[#3a322e] text-[#5c8a8a]'}`}
                    >
                       {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                    <input
                      type="range"
                      min="0" max="1" step="0.1"
                      value={volume}
                      onChange={(e) => {
                        const newVol = Number(e.target.value);
                        setVolume(newVol);
                        if (audioEngine.ctx && audioEngine.ctx.state !== 'suspended') {
                           audioEngine.playTone(880, 0.1, newVol);
                        }
                      }}
                      className="flex-1 h-2 bg-[#3a322e] rounded-lg appearance-none cursor-pointer accent-[#5c8a8a]"
                    />
                 </div>

              </div>
           </div>
        </div>

        {/* --- Main Content Area --- */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-y-auto no-scrollbar">
          
          {isFinished ? (
            <div className="animate-in zoom-in duration-500 text-center flex flex-col items-center">
              <div className="w-24 h-24 bg-[#9c6644] rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-[#9c6644]/40">
                 <Coffee size={48} className="text-[#f8f5f0]" />
              </div>
              <h2 className="text-3xl font-bold mb-2 tracking-tight">Enjoy Coffee!</h2>
              <p className="text-[#8c7b70]">抽出完了です。</p>
              <button 
                onClick={() => setMode('build')}
                className="mt-8 px-8 py-3 rounded-full bg-[#3a322e] text-[#dcd6d0] font-bold border border-[#4a403a]"
              >
                レシピに戻る
              </button>
            </div>
          ) : (
            <>
              {/* Step Info / Prep Info */}
              {/* items-center を追加して、子要素のspanが幅いっぱいに広がらないように修正 */}
              <div className="w-full text-center mb-4 z-10 min-h-[5rem] flex flex-col justify-center items-center">
                {isPreparing ? (
                   <div className="animate-pulse">
                      <span className="inline-block px-3 py-1 rounded-full bg-[#5c8a8a]/20 text-[#5c8a8a] text-xs font-bold tracking-wider uppercase border border-[#5c8a8a]/30 mb-2">
                        PREPARATION
                      </span>
                      <h2 className="text-2xl font-bold text-[#f8f5f0]">準備してください</h2>
                      <p className="text-[#dcd6d0] text-sm opacity-80 mt-1">ドリッパーにお湯を注ぐ準備を...</p>
                   </div>
                ) : (
                   <>
                    <span className="inline-block px-3 py-0.5 rounded-full bg-[#9c6644]/20 text-[#9c6644] text-[10px] font-bold tracking-wider uppercase border border-[#9c6644]/30 mb-2">
                      Step {currentStepIndex + 1} / {steps.length}
                    </span>
                    <h2 className="text-3xl font-bold text-[#f8f5f0] mb-1">{activeStep?.name}</h2>
                    <p className="text-[#dcd6d0] text-sm opacity-80 max-w-xs mx-auto line-clamp-2">
                      {activeStep?.description || "お湯を注いでください"}
                    </p>
                   </>
                )}
              </div>

              {/* Timer Visual (Scaled for mobile) */}
              <div className="relative flex items-center justify-center my-2 shrink-0">
                {/* ViewBoxを使って座標系を固定し、アニメーション計算を正確にする */}
                <svg 
                  className="transform -rotate-90 w-[min(65vw,280px)] h-[min(65vw,280px)]"
                  viewBox="0 0 280 280"
                >
                  {/* Background Circle */}
                  <circle
                    cx="140" cy="140" r={radius}
                    stroke="#3a322e" strokeWidth="12" fill="transparent"
                  />
                  {/* Progress Circle */}
                  <circle
                    cx="140" cy="140" r={radius}
                    stroke={
                        isPreparing ? "#5c8a8a" : 
                        remainingTimeDisplay <= 5 ? "#ef4444" : "#9c6644"
                    }
                    strokeWidth="12" fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                   <div className="text-[10px] text-[#8c7b70] uppercase tracking-widest font-bold mb-1">{subDisplayText}</div>
                   <div className={`text-6xl font-bold tracking-tighter tabular-nums leading-none ${
                       isPreparing ? 'text-[#5c8a8a]' : 
                       remainingTimeDisplay <= 5 ? 'text-red-400 animate-pulse' : 'text-[#f8f5f0]'
                    }`}>
                     {mainDisplayText}
                   </div>
                   
                   {!isPreparing && (
                     <div className="mt-3 flex flex-col items-center bg-[#3a322e]/50 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-[#4a403a]/50">
                       <div className="text-[#5c8a8a] font-bold text-xl flex items-baseline gap-1">
                          <Droplets size={14} className="fill-current" />
                          <span>{currentStepTargetWater}</span>
                          <span className="text-xs opacity-70">ml</span>
                       </div>
                     </div>
                   )}
                   
                   {isPreparing && (
                      <button 
                        onClick={skipPreparation}
                        className="mt-4 flex items-center gap-1 text-xs font-bold text-[#8c7b70] bg-[#3a322e] px-3 py-1.5 rounded-full border border-[#4a403a] active:bg-[#4a403a]"
                      >
                         <SkipForward size={12} /> SKIP
                      </button>
                   )}
                </div>
              </div>

              {/* Next Step Preview */}
              <div className="w-full max-w-xs mt-6 min-h-[4rem]">
                {!isPreparing && nextStep && (
                  <div className="bg-[#3a322e] rounded-xl p-3 border border-[#4a403a] flex items-center gap-3 shadow-lg">
                     <div className="w-8 h-8 rounded-full bg-[#2a2420] border border-[#4a403a] flex items-center justify-center shrink-0">
                        <ChevronDown size={14} className="text-[#8c7b70]" />
                     </div>
                     <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-[#8c7b70] font-bold uppercase mb-0.5">Next Step</p>
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-bold text-[#dcd6d0] line-clamp-1">{nextStep.name}</p>
                          <div className="flex gap-2 text-xs font-bold">
                             <span className="text-[#5c8a8a]">+{nextStep.water}ml</span>
                             <span className="text-[#9c6644]">{nextStep.time}s</span>
                          </div>
                        </div>
                     </div>
                  </div>
                )}
                 {!isPreparing && !nextStep && (
                   <div className="h-12 flex items-center justify-center text-[#4a403a] text-xs font-bold uppercase tracking-widest opacity-30">
                     Final Step
                   </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* --- Footer (Empty area for balance, or minimal indicators) --- */}
        {/* ボタン類はヘッダーに移動したので、ここは余白のみにするか、タップでヘッダーを開くヒントなどを置く */}
        <div className="flex-none h-8 w-full bg-[#2a2420]"></div>
      </div>
    );
  }

  // --- Main Build View ---
  return (
    <div className="min-h-screen bg-[#f8f5f0] text-[#4a403a] font-sans pb-28 md:pb-0 relative overscroll-none">
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
            Pour-Over-Calc
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
                <Coffee size={18} /> コーヒー豆の量 (g)
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
                <p className="text-xs text-[#8c7b70] font-bold uppercase mb-1">比率から算出した目標湯量</p>
                <p className="text-4xl font-bold text-[#4a403a]">{targetWater}<span className="text-xl text-[#8c7b70] ml-1">ml</span></p>
             </div>
             <div className="text-right pb-1">
                <p className="text-xs text-[#8c7b70] font-bold uppercase mb-1">抽出ステップ合計湯量</p>
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
              <Plus size={22} /> ステップを追加
            </button>
          </div>
        </div>
      </main>

      {/* Floating Action Button for Timer */}
      <div className="fixed bottom-8 right-8 md:absolute md:bottom-8 md:right-8 z-20">
        <button 
          onClick={() => {
            setMode('timer');
            // タイマーモードに入るときは初期状態でヘッダーを展開しておく（スタートボタンを押させるため）
            setIsTimerHeaderExpanded(true);
            // リセット
            resetTimer();
          }}
          className="bg-[#6b5143] text-[#f8f5f0] p-4 rounded-full shadow-xl shadow-[#6b5143]/40 hover:bg-[#5a4236] hover:scale-105 transition-all flex items-center gap-3 pr-8"
        >
          <div className="bg-[#f8f5f0] text-[#6b5143] rounded-full p-3">
            <Play size={24} className="ml-0.5" />
          </div>
          <span className="font-bold text-lg">タイマー画面</span>
        </button>
      </div>
    </div>
  );
};

export default App;