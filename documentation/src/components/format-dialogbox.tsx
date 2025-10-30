"use client"

import { useState } from "react"
import { X } from "lucide-react"
import React from "react"

interface FormatSettings {
  chooseValue: string
  textAlign: string
  thousandSeparator: string
  decimalSeparator: string
  decimalPlaces: string
  currencySymbol: string
  currencyAlign: string
  nullValue: string
  formatAsPercent: string
}

interface FormatDialogProps {
  isOpen: boolean
  onClose: () => void
  onApply: (settings: FormatSettings) => void
  selectedCell: { row: string; region: string; metric: string } | null
}

export default function FormatDialog({ isOpen, onClose, onApply, selectedCell }: FormatDialogProps) {
  const [settings, setSettings] = useState<FormatSettings>({
    chooseValue: "None",
    textAlign: "Left",
    thousandSeparator: ",",
    decimalSeparator: ".",
    decimalPlaces: "0",
    currencySymbol: "Dollar ($)",
    currencyAlign: "Left",
    nullValue: "None",
    formatAsPercent: "No",
  })

  const handleChange = (key: keyof FormatSettings, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleApply = () => {
    onApply(settings)
    setSettings({
      chooseValue: "None",
      textAlign: "Left",
      thousandSeparator: ",",
      decimalSeparator: ".",
      decimalPlaces: "0",
      currencySymbol: "Dollar ($)",
      currencyAlign: "Left",
      nullValue: "None",
      formatAsPercent: "No",
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-start justify-end z-50 p-4 pt-20">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-80 max-h-[80vh] overflow-y-auto border border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Format Cell</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Choose Value */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Choose Value:</label>
            <select
              value={settings.chooseValue}
              onChange={(e) => handleChange("chooseValue", e.target.value)}
              className="w-full px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>None</option>
              <option>Value 1</option>
              <option>Value 2</option>
            </select>
          </div>

          {/* Text Align */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Text Align:</label>
            <select
              value={settings.textAlign}
              onChange={(e) => handleChange("textAlign", e.target.value)}
              className="w-full px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Left</option>
              <option>Center</option>
              <option>Right</option>
            </select>
          </div>

          {/* Thousand Separator */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Thousand Separator:
            </label>
            <select
              value={settings.thousandSeparator}
              onChange={(e) => handleChange("thousandSeparator", e.target.value)}
              className="w-full px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>None</option>
              <option>,</option>
              <option>.</option>
              <option> </option>
            </select>
          </div>

          {/* Decimal Separator */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Decimal Separator:
            </label>
            <select
              value={settings.decimalSeparator}
              onChange={(e) => handleChange("decimalSeparator", e.target.value)}
              className="w-full px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>.</option>
              <option>,</option>
            </select>
          </div>

          {/* Decimal Places */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Decimal Places:</label>
            <select
              value={settings.decimalPlaces}
              onChange={(e) => handleChange("decimalPlaces", e.target.value)}
              className="w-full px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>0</option>
              <option>1</option>
              <option>2</option>
              <option>3</option>
              <option>4</option>
            </select>
          </div>

          {/* Currency Symbol */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Currency Symbol:
            </label>
            <select
              value={settings.currencySymbol}
              onChange={(e) => handleChange("currencySymbol", e.target.value)}
              className="w-full px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Dollar ($)</option>
              <option>Euro (€)</option>
              <option>Pound (£)</option>
              <option>Yen (¥)</option>
            </select>
          </div>

          {/* Currency Align */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Currency Align:</label>
            <select
              value={settings.currencyAlign}
              onChange={(e) => handleChange("currencyAlign", e.target.value)}
              className="w-full px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Left</option>
              <option>Right</option>
            </select>
          </div>

          {/* Null Value */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Null Value:</label>
            <select
              value={settings.nullValue}
              onChange={(e) => handleChange("nullValue", e.target.value)}
              className="w-full px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>None</option>
              <option>-</option>
              <option>N/A</option>
              <option>0</option>
            </select>
          </div>

          {/* Format as Percent */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Format as Percent:
            </label>
            <select
              value={settings.formatAsPercent}
              onChange={(e) => handleChange("formatAsPercent", e.target.value)}
              className="w-full px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>No</option>
              <option>Yes</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 sticky bottom-0">
          <button
            onClick={handleApply}
            className="flex-1 px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors"
          >
            Apply
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
