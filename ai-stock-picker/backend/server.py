"""
yfinance 股票数据服务
提供股票数据、K线图和技术指标的API
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import time
import random

app = Flask(__name__)
CORS(app)

def calculate_technical_indicators(df):
    """
    计算技术指标
    """
    result = []

    for i in range(len(df)):
        date = df.index[i].strftime('%Y-%m-%d')
        data = {
            'date': date,
            'open': float(df['Open'].iloc[i]),
            'high': float(df['High'].iloc[i]),
            'low': float(df['Low'].iloc[i]),
            'close': float(df['Close'].iloc[i]),
            'volume': int(df['Volume'].iloc[i])
        }

        # MA5, MA10, MA20
        if i >= 4:
            data['ma5'] = float(df['Close'].iloc[i-4:i+1].mean())
        else:
            data['ma5'] = data['close']

        if i >= 9:
            data['ma10'] = float(df['Close'].iloc[i-9:i+1].mean())
        else:
            data['ma10'] = data['close']

        if i >= 19:
            data['ma20'] = float(df['Close'].iloc[i-19:i+1].mean())
        else:
            data['ma20'] = data['close']

        # RSI
        if i >= 14:
            delta = df['Close'].iloc[i-13:i+1].diff()
            gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
            rs = gain / loss
            rsi = 100 - (100 / (1 + rs.iloc[-1]))
            data['rsi'] = float(rsi)
        else:
            data['rsi'] = 50

        # MACD
        if i >= 25:
            ema12 = df['Close'].iloc[i-25:i+1].ewm(span=12, adjust=False).mean().iloc[-1]
            ema26 = df['Close'].iloc[i-25:i+1].ewm(span=26, adjust=False).mean().iloc[-1]
            macd = ema12 - ema26
            data['macd'] = float(macd)
        elif i >= 12:
            ema12 = df['Close'].iloc[:i+1].ewm(span=12, adjust=False).mean().iloc[-1]
            ema26 = df['Close'].iloc[:i+1].ewm(span=26, adjust=False).mean().iloc[-1]
            macd = ema12 - ema26
            data['macd'] = float(macd)
        else:
            data['macd'] = 0

        result.append(data)

    return result

def generate_mock_history(symbol, days, base_price=None):
    """生成模拟历史数据"""
    if base_price is None:
        # 根据股票代码设置基础价格
        price_map = {
            'AAPL': 185.92, 'MSFT': 378.85, 'GOOGL': 140.87,
            'AMZN': 155.33, 'TSLA': 248.50, 'NVDA': 495.22,
            'META': 474.99, 'NFLX': 485.23
        }
        base_price = price_map.get(symbol.upper(), 150.00)

    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)

    dates = pd.date_range(start=start_date, end=end_date, freq='D')
    dates = [d for d in dates if d.weekday() < 5]  # 只保留工作日

    history = []
    price = base_price * 0.95  # 从稍低的价格开始

    for date in dates:
        # 随机价格变动
        change_percent = random.uniform(-0.02, 0.02)
        price = price * (1 + change_percent)

        open_price = price * random.uniform(0.99, 1.01)
        close_price = price
        high_price = max(open_price, close_price) * random.uniform(1.0, 1.015)
        low_price = min(open_price, close_price) * random.uniform(0.985, 1.0)
        volume = random.randint(10000000, 60000000)

        history.append({
            'date': date.strftime('%Y-%m-%d'),
            'open': round(open_price, 2),
            'high': round(high_price, 2),
            'low': round(low_price, 2),
            'close': round(close_price, 2),
            'volume': volume
        })

    # 计算技术指标
    df = pd.DataFrame(history)
    for i in range(len(df)):
        if i >= 4:
            df.at[i, 'ma5'] = float(df['close'].iloc[i-4:i+1].mean())
        else:
            df.at[i, 'ma5'] = df.at[i, 'close']

        if i >= 9:
            df.at[i, 'ma10'] = float(df['close'].iloc[i-9:i+1].mean())
        else:
            df.at[i, 'ma10'] = df.at[i, 'close']

        if i >= 19:
            df.at[i, 'ma20'] = float(df['close'].iloc[i-19:i+1].mean())
        else:
            df.at[i, 'ma20'] = df.at[i, 'close']

        if i >= 14:
            delta = df['close'].iloc[i-13:i+1].diff()
            gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
            rs = gain.iloc[-1] / loss.iloc[-1] if loss.iloc[-1] > 0 else 1
            rsi = 100 - (100 / (1 + rs))
            df.at[i, 'rsi'] = float(rsi)
        else:
            df.at[i, 'rsi'] = 50.0

    return df.to_dict('records')

def generate_mock_info(symbol):
    """生成模拟股票信息"""
    info_map = {
        'AAPL': {'name': 'Apple Inc.', 'sector': 'Technology', 'industry': 'Consumer Electronics', 'pe': 28.5, 'pb': 45.2},
        'MSFT': {'name': 'Microsoft Corporation', 'sector': 'Technology', 'industry': 'Software', 'pe': 35.2, 'pb': 12.8},
        'GOOGL': {'name': 'Alphabet Inc.', 'sector': 'Technology', 'industry': 'Internet Services', 'pe': 24.5, 'pb': 5.8},
        'AMZN': {'name': 'Amazon.com Inc.', 'sector': 'Consumer Cyclical', 'industry': 'Internet Retail', 'pe': 62.3, 'pb': 8.9},
        'TSLA': {'name': 'Tesla Inc.', 'sector': 'Consumer Cyclical', 'industry': 'Auto Manufacturers', 'pe': 72.5, 'pb': 10.2},
        'NVDA': {'name': 'NVIDIA Corporation', 'sector': 'Technology', 'industry': 'Semiconductors', 'pe': 65.3, 'pb': 38.5},
        'META': {'name': 'Meta Platforms Inc.', 'sector': 'Technology', 'industry': 'Internet Services', 'pe': 33.2, 'pb': 6.8},
        'NFLX': {'name': 'Netflix Inc.', 'sector': 'Communication', 'industry': 'Entertainment', 'pe': 45.0, 'pb': 12.5},
    }

    info = info_map.get(symbol.upper(), {
        'name': f'{symbol} Corporation',
        'sector': 'Technology',
        'industry': 'General',
        'pe': 25.0,
        'pb': 3.5
    })

    price_map = {
        'AAPL': 185.92, 'MSFT': 378.85, 'GOOGL': 140.87,
        'AMZN': 155.33, 'TSLA': 248.50, 'NVDA': 495.22,
        'META': 474.99, 'NFLX': 485.23
    }
    current_price = price_map.get(symbol.upper(), 150.00)

    return {
        'symbol': symbol.upper(),
        'name': info['name'],
        'sector': info['sector'],
        'industry': info['industry'],
        'currentPrice': current_price,
        'marketCap': current_price * random.randint(1, 50) * 1000000000,
        'peRatio': info['pe'],
        'pbRatio': info['pb'],
        'dividendYield': random.uniform(0, 2),
        '52WeekHigh': current_price * random.uniform(1.1, 1.3),
        '52WeekLow': current_price * random.uniform(0.7, 0.9),
        'avgVolume': random.randint(10000000, 50000000),
        'beta': round(random.uniform(0.5, 2.0), 2),
        'change': round(random.uniform(-5, 5), 2),
        'changePercent': round(random.uniform(-2, 2), 2)
    }

@app.route('/api/stock/<symbol>/info', methods=['GET'])
def get_stock_info(symbol):
    """获取股票基本信息"""
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info

        return jsonify({
            'success': True,
            'data': {
                'symbol': symbol.upper(),
                'name': info.get('longName', ''),
                'sector': info.get('sector', ''),
                'industry': info.get('industry', ''),
                'currentPrice': float(info.get('currentPrice', 0)),
                'marketCap': info.get('marketCap', 0),
                'peRatio': info.get('trailingPE', 0),
                'pbRatio': info.get('priceToBook', 0),
                'dividendYield': info.get('dividendYield', 0),
                '52WeekHigh': info.get('fiftyTwoWeekHigh', 0),
                '52WeekLow': info.get('fiftyTwoWeekLow', 0),
                'avgVolume': info.get('averageVolume', 0),
                'beta': info.get('beta', 0)
            }
        })
    except Exception as e:
        print(f"yfinance error for {symbol}: {str(e)}")
        # 降级到模拟数据
        mock_data = generate_mock_info(symbol)
        return jsonify({
            'success': True,
            'data': mock_data,
            'source': 'mock'
        })

@app.route('/api/stock/<symbol>/history', methods=['GET'])
def get_stock_history(symbol):
    """获取股票历史数据"""
    try:
        days = int(request.args.get('days', 90))
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)

        ticker = yf.Ticker(symbol)
        df = ticker.history(start=start_date, end=end_date)

        if df.empty:
            raise Exception("No data found from yfinance")

        # 计算技术指标
        technical_data = calculate_technical_indicators(df)

        # 计算涨跌幅
        if len(technical_data) >= 2:
            current_close = technical_data[-1]['close']
            prev_close = technical_data[-2]['close']
            change = current_close - prev_close
            change_percent = (change / prev_close) * 100
        else:
            change = 0
            change_percent = 0

        return jsonify({
            'success': True,
            'data': {
                'symbol': symbol.upper(),
                'currentPrice': technical_data[-1]['close'],
                'change': float(change),
                'changePercent': float(change_percent),
                'history': technical_data
            }
        })
    except Exception as e:
        print(f"yfinance history error for {symbol}: {str(e)}")
        # 降级到模拟数据
        days = int(request.args.get('days', 90))
        mock_history = generate_mock_history(symbol, days)

        # 计算涨跌幅
        if len(mock_history) >= 2:
            current_close = mock_history[-1]['close']
            prev_close = mock_history[-2]['close']
            change = current_close - prev_close
            change_percent = (change / prev_close) * 100
        else:
            change = 0
            change_percent = 0

        return jsonify({
            'success': True,
            'data': {
                'symbol': symbol.upper(),
                'currentPrice': mock_history[-1]['close'],
                'change': float(change),
                'changePercent': float(change_percent),
                'history': mock_history
            },
            'source': 'mock'
        })

@app.route('/api/stock/search', methods=['GET'])
def search_stocks():
    """搜索股票"""
    try:
        query = request.args.get('q', '').upper()

        if len(query) < 2:
            return jsonify({
                'success': False,
                'error': 'Query too short'
            }), 400

        # 热门股票列表（使用模拟数据）
        popular_stocks = {
            'AAPL': {'name': 'Apple Inc.', 'price': 185.92},
            'MSFT': {'name': 'Microsoft Corporation', 'price': 378.85},
            'GOOGL': {'name': 'Alphabet Inc.', 'price': 140.87},
            'AMZN': {'name': 'Amazon.com Inc.', 'price': 155.33},
            'TSLA': {'name': 'Tesla Inc.', 'price': 248.50},
            'META': {'name': 'Meta Platforms Inc.', 'price': 474.99},
            'NVDA': {'name': 'NVIDIA Corporation', 'price': 495.22},
            'NFLX': {'name': 'Netflix Inc.', 'price': 485.23},
            'AMD': {'name': 'Advanced Micro Devices', 'price': 125.43},
            'INTC': {'name': 'Intel Corporation', 'price': 45.67}
        }

        results = []
        for symbol, data in popular_stocks.items():
            if query in symbol:
                change = round(random.uniform(-5, 5), 2)
                change_percent = round((change / data['price']) * 100, 2)

                results.append({
                    'symbol': symbol,
                    'name': data['name'],
                    'price': data['price'],
                    'change': change,
                    'changePercent': change_percent,
                    'marketCap': data['price'] * random.randint(1, 50) * 1000000000
                })

        return jsonify({
            'success': True,
            'data': results,
            'source': 'mock'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
