const Card = ({ title, value, icon, bgColor = 'bg-gradient-to-br from-blue-500 to-blue-600' }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">{title}</p>
          <p className="text-4xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`${bgColor} p-4 rounded-xl text-white text-3xl shadow-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default Card;
