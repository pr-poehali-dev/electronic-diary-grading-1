const JournalLegend = () => {
  return (
    <div className="bg-slate-50 p-4 rounded-lg border">
      <p className="text-sm font-semibold mb-3 text-slate-700">Условные обозначения:</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-50 text-green-700 border border-green-200 rounded flex items-center justify-center font-bold">5</div>
          <span className="text-slate-600">Отлично</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-50 text-blue-700 border border-blue-200 rounded flex items-center justify-center font-bold">4</div>
          <span className="text-slate-600">Хорошо</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded flex items-center justify-center font-bold">3</div>
          <span className="text-slate-600">Удовлетворительно</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-50 text-red-700 border border-red-200 rounded flex items-center justify-center font-bold">2</div>
          <span className="text-slate-600">Неудовлетворительно</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-50 text-red-600 border border-red-200 rounded flex items-center justify-center font-semibold text-xs">Н</div>
          <span className="text-slate-600">Отсутствовал</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-50 text-orange-600 border border-orange-200 rounded flex items-center justify-center font-semibold text-xs">П</div>
          <span className="text-slate-600">Уважительная причина</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-sky-50 text-sky-600 border border-sky-200 rounded flex items-center justify-center font-semibold text-xs">Б</div>
          <span className="text-slate-600">Болел</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-50 text-red-700 border border-red-300 rounded flex items-center justify-center font-semibold text-[10px]">Н/А</div>
          <span className="text-slate-600">Не аттестован</span>
        </div>
      </div>
    </div>
  );
};

export default JournalLegend;
