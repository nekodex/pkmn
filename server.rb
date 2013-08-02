#!/usr/bin/env ruby
require 'sinatra'
require 'sinatra-websocket'
require 'json'
require 'cgi' # for CGI.escapeHTML

set :server, 'thin'

$pokedex = File.read("pkmn.json")

class Client
  def initialize(socket = nil, username = nil)
    @socket   = socket
    @username = username
    @channel  = nil
    @id       = SecureRandom.uuid
    @state    = {x: 0, y: 0, pokemon: 1, direction: "down", step: 0}
  end
  def socket=(socket)
    @socket ||= socket
  end
  def socket
    @socket
  end
  def username=(username)
    @username ||= username
  end
  def username
    @username
  end
  def channel=(channel)
    @channel = channel
  end
  def channel
    @channel
  end
  def move(x,y)
    @x = x
    @y = y
  end
  def state
    @state.merge({id: @id, name: @username})
  end
  def sync (state)
    @state['x'] = state['x']
    @state['y'] = state['y']
    @state['pokemon'] = state['pokemon']
    @state['direction'] = state['direction']
    @state['step'] = state['step']
    @username = @state['username']
  end
  def send(msg)
    @socket.send(msg)
  end
  def id
    @id
  end
end

class Channel
  def initialize(name)
    @name = name
    @clients ||= []
  end
  def name=(name)
    @name = name
  end
  def name
    @name
  end
  def join(client)
    @clients << client
    client.channel = self.name
    send(client, 'join', {state: client.state})
  end
  def part(client)
    send(client, 'part')
    client.channel = nil
    @clients.delete(client)
  end
  def chat(sender, message)
    warn("[CHAT] <#{sender.id}> #{message}")
    send(sender, 'msg', message)
  end
  def move(sender, state)
    send(sender, 'move', state.to_json)
  end
  def send(sender, event, payload=nil)
    @clients.each do |client|
      next if client.id == sender.id
      client.send({sender: sender.id, event: event, payload: payload}.to_json)
    end
  end
end

class World
  def initialize
    @clients  ||= []
    @channels ||= {}
  end
  def state
    states = []
    @clients.each do |client|
      states << client.state
    end
    states
  end
  def add_client(client)
    @clients << client
    world_state = {id: client.id, state: state, pokedex: $pokedex}
    clients_list = @clients.map { |c| "#{c.username}(#{c.id})" }.join(', ')
    warn("CLIENTS: #{clients_list}")
    client.send({sender: 'SYSTEM', event: 'connect', payload: world_state}.to_json)
  end
  def remove_client(client)
    @channels[client.channel].part(client) unless client.channel.nil?
    @clients.delete(client)
    warn("<- [SOCK] socket closed (#{client.username}), #{connected_count} connected")
  end
  def connected_count
    @clients.count
  end
  def find_client(websocket)
    @clients.each do |client|
      return client if client.socket == websocket
    end
  end
  def parse(socket, data)
    data = JSON.parse(data)
    client = find_client(socket)

    case data['event']
      when "join"
        client.username = data['username'] #hack
        @channels[client.channel].part(client) unless client.channel.nil?
        @channels[data['channel']] ||= Channel.new(data['channel'])
        @channels[data['channel']].join client

      when "part"
        @channels[data['channel']].part(client) unless client.channel.nil?

      when "msg"
        @channels[client.channel].chat(client, data['msg'])

      when "move"
        @channels[client.channel].move(client, data['state'])
        client.sync(data['state'])
    end
  end
end

$world = World.new

get '/' do
  return unless request.websocket?
  request.websocket do |ws|
    ws.onopen do
      begin
        $world.add_client Client.new(ws)
        warn("-> [SOCK] socket connected, #{$world.connected_count} connected")
      rescue Exception => e
        warn("CAUGHT EXCEPTION: #{e}")
      end
    end
    ws.onmessage do |data|
      EM.next_tick {
        begin
          $world.parse ws, data
        rescue Exception => e
          warn("CAUGHT EXCEPTION: #{e}")
        end
      }
    end
    ws.onclose do
      begin
        $world.remove_client($world.find_client(ws))
      rescue Exception => e
        warn("CAUGHT EXCEPTION: #{e}")
      end
    end
  end
end
