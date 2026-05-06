import React from 'react';

const MatchCard = ({ match }) => {
  return (
    <article className="surface-card p-5 transition duration-200 hover:shadow-md">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-800">{match.jobTitle}</h3>
          <p className="text-sm font-medium text-slate-500">{match.company}</p>
        </div>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
          {match.matchScore}% Match
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{match.status}</span>
        <button className="text-sm font-semibold text-blue-700 hover:underline">View Details</button>
      </div>
    </article>
  );
};

export default MatchCard;

