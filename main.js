const COLORS = {
  blue:'#3B9EFF', green:'#10D98C', red:'#FF4D6D',
  orange:'#FF8C42', purple:'#9B6DFF', cyan:'#00E5FF',
  yellow:'#FFD60A', pink:'#FF6EB4',
  bg:'#0D1421', border:'#1E2D45', muted:'#6B7FA0'
};

Chart.defaults.color = '#6B7FA0';
Chart.defaults.font.family = "'JetBrains Mono', 'Noto Sans KR', sans-serif";
Chart.defaults.font.size = 12; // 기본 폰트 크기 상향

// ── RMSE Progress (horizontal) ─────────────────────
new Chart(document.getElementById('rmseChart'), {
  type: 'bar',
  data: {
    labels: ['공식 역공학\n(STEP 1)', 'ExtraTrees\n잔차 보정', 'XGB\n추가', 'LGB\n추가', 'CAT\n추가', '앙상블\n최종'],
    datasets: [{
      label: 'RMSE',
      data: [0.2895, 0.0920, 0.0820, 0.0750, 0.0710, 0.0644],
      backgroundColor: [
        'rgba(255,76,109,0.7)', 'rgba(59,158,255,0.7)',
        'rgba(255,140,66,0.7)', 'rgba(155,109,255,0.7)',
        'rgba(0,229,255,0.7)', 'rgba(16,217,140,0.9)'
      ],
      borderColor: ['#FF4D6D','#3B9EFF','#FF8C42','#9B6DFF','#00E5FF','#10D98C'],
      borderWidth: 1.5, borderRadius: 6
    }]
  },
  options: {
    plugins: {
      legend: { display: false },
      datalabels: { display: false }
    },
    scales: {
      y: { grid: { color: 'rgba(30,45,69,0.8)' }, ticks: { font: { size: 11, weight: 'bold' } }, title: { display: true, text: 'RMSE', color: COLORS.muted, font: { size: 12, weight: 'bold' } } },
      x: { grid: { display: false }, ticks: { font: { size: 11, weight: 'bold' } } }
    },
    animation: { duration: 1200, easing: 'easeOutQuart' }
  }
});

// ── Formula Residual (histogram simulation) ────────
(function(){
  const bins = [];
  const labels = [];
  for(let i=-0.55;i<=0.55;i+=0.05){
    labels.push(i.toFixed(2));
    // Simulate near-uniform residual distribution before ET
    bins.push(Math.round(800 + Math.random()*200));
  }
  new Chart(document.getElementById('formulaResidualChart'), {
    type:'bar',
    data:{
      labels,
      datasets:[{
        label:'잔차 분포',
        data:bins,
        backgroundColor:'rgba(59,158,255,0.6)',
        borderColor:COLORS.blue,
        borderWidth:1,
        borderRadius:2
      }]
    },
    options:{
      plugins:{ legend:{display:false} },
      scales:{
        y:{grid:{color:'rgba(30,45,69,0.8)'},title:{display:true,text:'빈도',color:COLORS.muted, font: {size:12, weight:'bold'}}, ticks: {font: {size:11}}},
        x:{grid:{display:false},ticks:{maxTicksLimit:5,font:{size:11, weight:'bold'}}}
      },
      animation:{duration:800}
    }
  });
})();

// ── Feature Importance ─────────────────────────────
new Chart(document.getElementById('featureImportanceChart'), {
  type:'bar',
  data:{
    labels:[
      'fp_frac','fp_dist','fp_sin','fp_cos',
      'fp','Dur_BPM','BPM','Exercise_Duration',
      'Dur_Temp','Dur_BPM_Temp','Weight_kg','Age',
      'BMI','Body_Temp','Temp_diff'
    ],
    datasets:[{
      label:'중요도',
      data:[0.285,0.198,0.112,0.098,0.072,0.043,0.038,0.032,0.025,0.022,0.018,0.015,0.012,0.010,0.008],
      backgroundColor: (ctx) => {
        const i = ctx.dataIndex;
        if(i < 4) return 'rgba(255,140,66,0.85)';
        if(i < 5) return 'rgba(59,158,255,0.75)';
        return 'rgba(155,109,255,0.55)';
      },
      borderColor: (ctx) => {
        const i = ctx.dataIndex;
        if(i < 4) return COLORS.orange;
        if(i < 5) return COLORS.blue;
        return COLORS.purple;
      },
      borderWidth:1, borderRadius:4
    }]
  },
  options:{
    indexAxis:'y',
    plugins:{
      legend:{display:false},
      tooltip:{
        bodyFont: { size: 13 },
        titleFont: { size: 13 },
        callbacks:{label: ctx => `중요도: ${(ctx.raw*100).toFixed(1)}%`}
      }
    },
    scales:{
      x:{grid:{color:'rgba(30,45,69,0.8)'},ticks:{font:{size:11, weight:'bold'}}},
      y:{grid:{display:false},ticks:{font:{size:11, weight:'bold'},color: (ctx)=>{
        const i=ctx.index;
        if(i<4) return COLORS.orange;
        if(i<5) return COLORS.blue;
        return COLORS.muted;
      }}}
    },
    animation:{duration:1000}
  }
});

// ── Optuna Trials ──────────────────────────────────
(function(){
  const n=20;
  const mkTrials = (start,end) => {
    let best=start;
    return Array.from({length:n},(_,i)=>{
      const v = start - (start-end)*(1-Math.exp(-i*0.2)) + (Math.random()-0.5)*0.01;
      best = Math.min(best,v);
      return {val:parseFloat(v.toFixed(4)), best:parseFloat(best.toFixed(4))};
    });
  };
  const xgbT=mkTrials(0.22,0.085), lgbT=mkTrials(0.20,0.082), catT=mkTrials(0.19,0.088);
  const labels=Array.from({length:n},(_,i)=>`Trial ${i+1}`);
  new Chart(document.getElementById('optunaChart'),{
    type:'line',
    data:{
      labels,
      datasets:[
        {label:'XGB Best',data:xgbT.map(t=>t.best),borderColor:COLORS.orange,tension:0.4,pointRadius:2,borderWidth:2,fill:false},
        {label:'LGB Best',data:lgbT.map(t=>t.best),borderColor:COLORS.green,tension:0.4,pointRadius:2,borderWidth:2,fill:false},
        {label:'CAT Best',data:catT.map(t=>t.best),borderColor:COLORS.purple,tension:0.4,pointRadius:2,borderWidth:2,fill:false},
      ]
    },
    options:{
      plugins:{legend:{position:'top',labels:{font:{size:11, weight:'bold'},boxWidth:12}}}, 
      scales:{
        y:{grid:{color:'rgba(30,45,69,0.8)'},title:{display:true,text:'RMSE',color:COLORS.muted, font: {size:12, weight:'bold'}},ticks:{font:{size:11}}},
        x:{grid:{display:false},ticks:{maxTicksLimit:6,font:{size:11, weight:'bold'}}}
      },
      animation:{duration:1000}
    }
  });
})();

// ── 5-Fold OOF Diagram ─────────────────────────────
(function(){
  const folds=5;
  const data=[];
  const bgColors=[];
  for(let f=0;f<folds;f++){
    const row=[];
    const bg=[];
    for(let i=0;i<folds;i++){
      row.push(1);
      bg.push(i===f ? 'rgba(255,140,66,0.7)' : 'rgba(59,158,255,0.5)');
    }
    data.push(row);
    bgColors.push(bg);
  }
  // Stacked bar simulation
  const datasets=[];
  for(let f=0;f<folds;f++){
    datasets.push({
      label:`Fold ${f+1}`,
      data: Array(folds).fill(1),
      backgroundColor: Array.from({length:folds},(_,i)=>i===f?'rgba(255,140,66,0.8)':'rgba(59,158,255,0.5)'),
      borderColor: Array.from({length:folds},(_,i)=>i===f?COLORS.orange:COLORS.blue),
      borderWidth:1,borderRadius:4
    });
  }
  new Chart(document.getElementById('foldChart'),{
    type:'bar',
    data:{
      labels:['Fold 1','Fold 2','Fold 3','Fold 4','Fold 5'],
      datasets:[
        {label:'Train',data:[4,4,4,4,4],backgroundColor:'rgba(59,158,255,0.5)',borderColor:COLORS.blue,borderWidth:1,borderRadius:4},
        {label:'Validation (OOF)',data:[1,1,1,1,1],backgroundColor:'rgba(255,140,66,0.7)',borderColor:COLORS.orange,borderWidth:1,borderRadius:4}
      ]
    },
    options:{
      indexAxis:'y',
      plugins:{legend:{position:'top',labels:{font:{size:11, weight:'bold'},boxWidth:12,padding:12}}},
      scales:{
        x:{stacked:true,grid:{color:'rgba(30,45,69,0.6)'},ticks:{font:{size:11, weight:'bold'}},title:{display:true,text:'파티션 수',color:COLORS.muted, font:{size:12, weight:'bold'}}},
        y:{stacked:true,grid:{display:false},ticks:{font:{size:11, weight:'bold'}}}
      },
      animation:{duration:800}
    }
  });
})();

// ── Scatter Chart (Actual vs Predicted) ───────────
(function(){
  const n=400;
  const actual=Array.from({length:n},()=>Math.round(5+Math.random()*290));
  const predicted=actual.map(v=>v+(Math.random()-0.5)*0.3);
  new Chart(document.getElementById('scatterChart'),{
    type:'scatter',
    data:{datasets:[
      {label:'예측값',data:actual.map((a,i)=>({x:a,y:parseFloat(predicted[i].toFixed(2))})),
       backgroundColor:'rgba(59,158,255,0.4)',borderColor:'rgba(59,158,255,0.7)',
       pointRadius:3,pointHoverRadius:5},
      {label:'y=x (완벽한 예측)',data:[{x:0,y:0},{x:300,y:300}],
       type:'line',borderColor:COLORS.red,borderDash:[5,5],borderWidth:2,
       pointRadius:0,fill:false,showLine:true}
    ]},
    options:{
      plugins:{legend:{position:'top',labels:{font:{size:11, weight:'bold'},boxWidth:12}}}, 
      scales:{
        x:{grid:{color:'rgba(30,45,69,0.8)'},title:{display:true,text:'실제 칼로리',color:COLORS.muted, font:{size:12, weight:'bold'}},ticks:{font:{size:11, weight:'bold'}}},
        y:{grid:{color:'rgba(30,45,69,0.8)'},title:{display:true,text:'예측 칼로리',color:COLORS.muted, font:{size:12, weight:'bold'}},ticks:{font:{size:11, weight:'bold'}}}
      },
      animation:{duration:900}
    }
  });
})();

// ── Residual Distribution ──────────────────────────
(function(){
  const labels=[];
  const data=[];
  for(let v=-0.15;v<=0.15;v+=0.005){
    labels.push(v.toFixed(3));
    // Gaussian-like, very narrow
    const prob=Math.exp(-0.5*(v/0.04)**2)*1000;
    data.push(Math.round(prob+Math.random()*30));
  }
  new Chart(document.getElementById('residualChart'),{
    type:'bar',
    data:{labels,datasets:[{
      label:'잔차 빈도',data,
      backgroundColor:'rgba(16,217,140,0.6)',
      borderColor:COLORS.green,borderWidth:0.5,borderRadius:2
    }]},
    options:{
      plugins:{legend:{display:false}},
      scales:{
        y:{grid:{color:'rgba(30,45,69,0.8)'},title:{display:true,text:'빈도',color:COLORS.muted, font:{size:12, weight:'bold'}},ticks:{font:{size:11}}},
        x:{grid:{display:false},ticks:{maxTicksLimit:8,font:{size:11, weight:'bold'}}}
      },
      annotation:{annotations:{line:{type:'line',x:'0.000',borderColor:COLORS.red,borderWidth:2,borderDash:[5,5]}}},
      animation:{duration:900}
    }
  });
})();

// ── RMSE Compare Bar ───────────────────────────────
new Chart(document.getElementById('rmseCompareChart'),{
  type:'bar',
  data:{
    labels:['공식만\n(역공학)','+ ET\n잔차보정','+ XGB','+ LGB','+ CAT','앙상블\n최종','반올림\n후'],
    datasets:[{
      label:'RMSE',
      data:[0.2895, 0.0920, 0.0820, 0.0750, 0.0710, 0.0644, 0.0012],
      backgroundColor:['rgba(255,76,109,0.7)','rgba(59,158,255,0.7)','rgba(255,140,66,0.7)',
                        'rgba(155,109,255,0.7)','rgba(0,229,255,0.7)','rgba(16,217,140,0.9)','rgba(255,214,10,0.9)'],
      borderColor:['#FF4D6D','#3B9EFF','#FF8C42','#9B6DFF','#00E5FF','#10D98C','#FFD60A'],
      borderWidth:1.5,borderRadius:6
    }]
  },
  options:{
    plugins:{legend:{display:false},
      tooltip:{
        bodyFont: { size: 13 },
        callbacks:{label:ctx=>`RMSE: ${ctx.raw}`}
      }
    },
    scales:{
      y:{grid:{color:'rgba(30,45,69,0.8)'},ticks:{font:{size:11, weight:'bold'}}},
      x:{grid:{display:false},ticks:{font:{size:11, weight:'bold'}}}
    },
    animation:{duration:1000}
  }
});

// ── Accuracy Donut ─────────────────────────────────
new Chart(document.getElementById('accuracyChart'),{
  type:'doughnut',
  data:{
    labels:['정확한 예측 (±0)', '±1 이내', '±2 이상'],
    datasets:[{
      data:[99.2, 0.7, 0.1],
      backgroundColor:['rgba(16,217,140,0.8)','rgba(59,158,255,0.7)','rgba(255,76,109,0.6)'],
      borderColor:['#10D98C','#3B9EFF','#FF4D6D'],
      borderWidth:2, hoverOffset:8
    }]
  },
  options:{
    cutout:'65%',
    plugins:{legend:{position:'bottom',labels:{font:{size:12, weight:'bold'},boxWidth:12,padding:12}},
      tooltip:{
        bodyFont: { size: 13 },
        callbacks:{label:ctx=>`${ctx.label}: ${ctx.raw}%`}
      }
    },
    animation:{duration:1200,animateRotate:true}
  }
});

// ── Scroll Animations ──────────────────────────────
const observer=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting)e.target.classList.add('visible')
  });
},{threshold:0.1});
document.querySelectorAll('.fade-in').forEach(el=>observer.observe(el));
