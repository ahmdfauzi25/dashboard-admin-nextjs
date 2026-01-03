'use client'

import React from 'react'

export default function DashboardPage() {
  return (
    <div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* Monthly Target Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <svg className="w-32 h-32 text-violet-600 mb-4" fill="none" viewBox="0 0 36 36" stroke="currentColor" strokeWidth="2" style={{transform: 'rotate(-90deg)'}}>
            <path strokeLinecap="round" strokeLinejoin="round" className="text-gray-200" d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831" />
            <path strokeLinecap="round" strokeLinejoin="round" className="text-violet-600" strokeDasharray="75.55, 100" d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831" />
            <text x="50%" y="50%" textAnchor="middle" alignmentBaseline="middle" className="text-xl font-bold text-gray-800" fill="currentColor" style={{transform: 'rotate(90deg) translate(-50%, -50%)', transformOrigin: 'center'}}>75.55%</text>
          </svg>
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">+10%</span>
          
          <h2 className="text-md font-semibold text-gray-700 mb-2 mt-4">Monthly Target</h2>
          <p className="text-sm text-gray-500 mt-1">You earn $3287 today, it's higher than last month.</p>
          <p className="text-sm text-gray-500">Keep up your good work!</p>
          
          <div className="flex justify-around w-full mt-6 text-sm border-t border-gray-200 pt-4">
            <div className="flex flex-col items-center">
              <p className="text-gray-500">Target</p>
              <p className="font-bold text-gray-800 flex items-center">$20K <svg className="h-4 w-4 text-red-500 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg></p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-gray-500">Revenue</p>
              <p className="font-bold text-gray-800 flex items-center">$20K <svg className="h-4 w-4 text-green-500 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"/></svg></p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-gray-500">Today</p>
              <p className="font-bold text-gray-800 flex items-center">$20K <svg className="h-4 w-4 text-green-500 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"/></svg></p>
            </div>
          </div>
        </div>

        {/* Customers Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 flex items-start space-x-4">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h-2V7a4 4 0 00-8 0v13H5a1 1 0 000 2h14a1 1 0 000-2zM9 7a2 2 0 014 0v13H9V7z"/></svg>
          </div>
          <div>
            <p className="text-sm text-gray-500">Customers</p>
            <div className="flex items-baseline space-x-2">
              <h3 className="text-3xl font-bold text-gray-800">3,782</h3>
              <div className="flex items-center text-sm">
                <svg className="h-4 w-4 text-green-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>
                <span className="text-green-500">11.01%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 flex items-start space-x-4">
          <div className="p-3 rounded-full bg-orange-100 text-orange-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
          </div>
          <div>
            <p className="text-sm text-gray-500">Orders</p>
            <div className="flex items-baseline space-x-2">
              <h3 className="text-3xl font-bold text-gray-800">5,359</h3>
              <div className="flex items-center text-sm">
                <svg className="h-4 w-4 text-red-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
                <span className="text-red-500">9.05%</span>
              </div>
            </div>
          </div>
        </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Monthly Sales Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Monthly Sales</h2>
          {/* Dropdown / Menu icon */}
          <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"/>
          </svg>
        </div>
        <div className="h-64 bg-gray-50 rounded-md p-4">
          <p className="text-gray-400">[Monthly Sales Chart Placeholder]</p>
        </div>
      </div>

      {/* Statistics Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Statistics</h2>
          <div className="flex space-x-2">
            <button className="px-3 py-1 text-sm rounded-md bg-gray-100 text-gray-700 font-medium hover:bg-gray-200">Monthly</button>
            <button className="px-3 py-1 text-sm rounded-md text-gray-600 hover:bg-gray-100">Quarterly</button>
            <button className="px-3 py-1 text-sm rounded-md text-gray-600 hover:bg-gray-100">Annually</button>
            <button className="px-3 py-1 text-sm rounded-md flex items-center text-gray-600 hover:bg-gray-100">
              <svg className="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h.01M7 12h.01M7 15h.01M7 18h.01M11 12h.01M11 15h.01M11 18h.01M15 12h.01M15 15h.01M15 18h.01M17 12h.01M17 15h.01M17 18h.01M3 8v13a2 2 0 002 2h14a2 2 0 002-2V8M4 7h16a1 1 0 011 1v0a1 1 0 01-1 1H4a1 1 0 01-1-1v0a1 1 0 011-1z"/></svg>
              <span className="text-sm text-gray-600">Dec 28 to Jan 03</span>
            </button>
          </div>
        </div>
        <div className="h-64 bg-gray-50 rounded-md p-4">
          <p className="text-gray-400">[Statistics Chart Placeholder]</p>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Customers Demographic */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Customers Demographic</h2>
          {/* Dropdown / Menu icon */}
          <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"/>
          </svg>
        </div>
        <div className="h-64 bg-gray-50 rounded-md p-4 flex items-center justify-center">
          <p className="text-gray-400">[Customers Demographic Map Placeholder]</p>
        </div>
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src="https://flagcdn.com/us.svg" alt="US Flag" className="h-5 w-8 rounded-sm" />
              <span className="text-gray-700 font-medium">USA</span>
              <span className="text-sm text-gray-500">2,379 Customers</span>
            </div>
            <span className="text-gray-700 font-medium">79%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{width: '79%'}}></div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-3">
              <img src="https://flagcdn.com/fr.svg" alt="FR Flag" className="h-5 w-8 rounded-sm" />
              <span className="text-gray-700 font-medium">France</span>
              <span className="text-sm text-gray-500">589 Customers</span>
            </div>
            <span className="text-gray-700 font-medium">23%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-green-600 h-2.5 rounded-full" style={{width: '23%'}}></div>
          </div>
        </div>
      </div>
    </div>

    {/* Recent Orders Table */}
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-700">Recent Orders</h2>
        <div className="flex space-x-2">
          <button className="px-3 py-1 text-sm rounded-md bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 flex items-center">
            <svg className="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM10 9l3 3m0 0l-3 3m3-3H5m11 4h2l2-2m0 0l-2-2h-2m-3-4V3m-9 8h.01M7 12h.01M7 15h.01M7 18h.01M11 12h.01M11 15h.01M11 18h.01M15 12h.01M15 15h.01M15 18h.01M17 12h.01M17 15h.01M17 18h.01M3 8v13a2 2 0 002 2h14a2 2 0 002-2V8M4 7h16a1 1 0 011 1v0a1 1 0 01-1 1H4a1 1 0 01-1-1v0a1 1 0 011-1z"/></svg>
            Filter
          </button>
          <button className="px-3 py-1 text-sm rounded-md bg-violet-600 text-white font-medium hover:bg-violet-700">See all</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <img className="h-10 w-10 rounded-full" src="https://via.placeholder.com/40" alt="" />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">MacBook Pro 13"</div>
                    <div className="text-sm text-gray-500">2 variants</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Laptop</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$2399.00</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"> Delivered </span>
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <img className="h-10 w-10 rounded-full" src="https://via.placeholder.com/40" alt="" />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">Apple Watch Ultra</div>
                    <div className="text-sm text-gray-500">1 variant</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Watch</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$879.00</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800"> Pending </span>
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <img className="h-10 w-10 rounded-full" src="https://via.placeholder.com/40" alt="" />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">iPhone 15 Pro Max</div>
                    <div className="text-sm text-gray-500">2 variants</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">SmartPhone</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$1869.00</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"> Delivered </span>
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <img className="h-10 w-10 rounded-full" src="https://via.placeholder.com/40" alt="" />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">iPad Pro 3rd Gen</div>
                    <div className="text-sm text-gray-500">2 variants</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Electronics</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$1699.00</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800"> Canceled </span>
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <img className="h-10 w-10 rounded-full" src="https://via.placeholder.com/40" alt="" />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">AirPods Pro 2nd Gen</div>
                    <div className="text-sm text-gray-500">1 variant</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Accessories</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$240.00</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"> Delivered </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
)
}