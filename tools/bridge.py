#!/usr/bin/env python3
"""BalanceBot PS1/x360ce bridge. Sends the documented one-character protocol."""
import argparse, socket, sys, time
try:
    import serial
except ImportError:
    serial = None

COMMANDS = {'forward':'F','back':'B','left':'L','right':'R','stop':'S','horn':'h','horn1':'1','horn2':'2','horn3':'3','horn4':'4','speed_up':'+','speed_down':'-','spin_cw':'C','spin_ccw':'c'}

def send_serial(port, baud, command):
    if serial is None: raise RuntimeError('Install pyserial for USB mode: python3 -m pip install pyserial')
    with serial.Serial(port, baudrate=baud, timeout=0.2) as link:
        link.write(command.encode('ascii')); link.flush()

def send_wifi(host, port, command):
    with socket.create_connection((host, port), timeout=2) as link:
        link.sendall(command.encode('ascii'))

def send(target, args, command):
    if target == 'serial': send_serial(args.port, args.baud, command)
    else: send_wifi(args.host, args.tcp_port, command)

def main():
    p=argparse.ArgumentParser(description='PS1/x360ce to Arduino/ESP32 BalanceBot bridge')
    p.add_argument('--transport', choices=['serial','wifi'], default='serial')
    p.add_argument('--port', default='/dev/ttyACM0'); p.add_argument('--baud', type=int, default=115200)
    p.add_argument('--host', default='192.168.4.1'); p.add_argument('--tcp-port', type=int, default=3333)
    p.add_argument('--command', choices=sorted(COMMANDS)); p.add_argument('--repeat', action='store_true')
    args=p.parse_args()
    if args.command:
        send(args.transport,args,COMMANDS[args.command]); return
    print('Interactive fallback: type F/B/L/R/S, h, 1-4, +, -, C/c; Ctrl-C exits.')
    while True:
        command=input('BalanceBot> ').strip()
        if not command: continue
        if command in COMMANDS: command=COMMANDS[command]
        if len(command)!=1: print('Unknown command'); continue
        send(args.transport,args,command)
        if not args.repeat: time.sleep(.02)

if __name__ == '__main__':
    try: main()
    except KeyboardInterrupt: print('\nStopped')
    except Exception as exc: print(f'Bridge error: {exc}', file=sys.stderr); raise
