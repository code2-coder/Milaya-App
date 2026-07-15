import React from 'react';
import { MapPin, Plus, CheckCircle, MoreVertical, Trash2, Edit } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export const AddressBook = ({ addresses, selectedAddressId, onSelect, onAdd, onEdit, onDelete, onSetDefault }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-2xl font-serif font-medium text-[#0B0F19]">Delivery Address</h2>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-bold">Select or add a new destination</p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#800000] hover:text-[#5C1A1B] transition-colors group"
        >
          <div className="p-1.5 rounded-full border border-[#800000]/30 group-hover:border-[#800000] transition-colors bg-red-50/50">
            <Plus className="w-4 h-4" />
          </div>
          <span>Add New</span>
        </button>
      </div>

      {(!addresses || addresses.length === 0) ? (
        <div className="bg-[#FAF9F6] rounded-2xl border border-gray-150 p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100">
            <MapPin className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-serif font-bold text-gray-900 mb-2">No Saved Addresses</h3>
          <p className="text-gray-500 mb-6 text-sm">You haven't saved any delivery destinations yet.</p>
          <button
            onClick={onAdd}
            className="bg-gradient-to-r from-[#5C1A1B] to-[#800000] text-white text-xs font-bold uppercase tracking-widest px-6 py-3.5 hover:shadow-lg transition-all rounded-xl border border-[#B8934E]/20"
          >
            Add New Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => {
            const isSelected = selectedAddressId === address._id;
            return (
              <div
                key={address._id}
                className={`relative p-5 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden ${
                  isSelected
                    ? 'border-[#B8934E] bg-[#FAF9F6] ring-1 ring-[#B8934E]/25 shadow-md scale-[1.01]'
                    : 'border-gray-200 bg-white hover:border-[#B8934E]/40 hover:bg-[#FCFAF8]'
                }`}
                onClick={() => onSelect(address)}
              >
                {/* Checkmark for selection */}
                {isSelected && (
                  <div className="absolute top-4 right-4 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-[#B8934E]" />
                  </div>
                )}

                <div className="pr-10">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="font-serif font-semibold text-[#0B0F19] text-base leading-tight">{address.fullName}</h3>
                    {address.title && (
                      <span className="bg-white border border-[#B8934E]/30 text-[#B8934E] text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md">
                        {address.title}
                      </span>
                    )}
                    {address.isDefault && (
                      <span className="bg-[#800000] text-white text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md shadow-sm">
                        Default
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-4 leading-relaxed font-sans font-medium">
                    {address.address}, {address.city}
                    {address.state && `, ${address.state}`} <br />
                    {address.country} - {address.zipCode}
                  </p>
                  
                  <div className="text-sm text-gray-900 flex flex-col space-y-1.5 border-t border-gray-100 pt-3">
                    <div className="flex items-center">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider w-16">Phone:</span>
                      <span className="font-semibold text-obsidian">{address.phoneNo}</span>
                    </div>
                    {address.altPhoneNo && (
                      <div className="flex items-center">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider w-16">Alt:</span>
                        <span className="font-semibold text-obsidian">{address.altPhoneNo}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dropdown Menu for Actions */}
                <div className="absolute bottom-3 right-3" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-2 text-gray-400 hover:text-[#B8934E] rounded-full hover:bg-gray-100 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-100 shadow-xl rounded-2xl py-1 z-30">
                      <DropdownMenuItem 
                        onClick={() => onEdit(address)}
                        className="cursor-pointer py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-gray-700 focus:bg-gray-50 transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5 mr-2.5 text-gray-400" />
                        Edit Address
                      </DropdownMenuItem>
                      {!address.isDefault && (
                        <DropdownMenuItem 
                          onClick={() => onSetDefault(address._id)}
                          className="cursor-pointer py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-gray-700 focus:bg-gray-50 transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5 mr-2.5 text-[#B8934E]" />
                          Set as Default
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => onDelete(address._id)}
                        className="cursor-pointer py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-red-600 focus:bg-red-50 focus:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-2.5 text-red-400" />
                        Delete Address
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
