import React from "react";
import { Check, Clock, X } from "lucide-react";

export const ReturnTimeline = ({ timeline }) => {
  if (!timeline || timeline.length === 0) return null;

  return (
    <div className="flow-root mt-6">
      <ul role="list" className="-mb-8">
        {timeline.map((event, eventIdx) => {
          const isLast = eventIdx === timeline.length - 1;
          const isRejected = event.status === "Rejected";
          const isCompleted = event.status === "Refund Completed";
          
          let Icon = Clock;
          let iconBg = "bg-gray-400";
          
          if (isRejected) {
            Icon = X;
            iconBg = "bg-red-500";
          } else if (isCompleted) {
            Icon = Check;
            iconBg = "bg-emerald-500";
          } else if (event.status !== "Pending Review") {
            Icon = Check;
            iconBg = "bg-blue-500";
          }

          return (
            <li key={event._id || eventIdx}>
              <div className="relative pb-8">
                {!isLast ? (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                ) : null}
                <div className="relative flex space-x-3">
                  <div>
                    <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${iconBg}`}>
                      <Icon className="h-5 w-5 text-white" aria-hidden="true" />
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium text-gray-900 mr-2">{event.status}</span>
                        {event.message}
                      </p>
                    </div>
                    <div className="whitespace-nowrap text-right text-sm text-gray-500">
                      {new Date(event.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
