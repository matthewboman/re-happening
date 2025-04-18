class ApiController < ApplicationController
    protect_from_forgery with: :null_session

    # POST - Create a new track.
    def create_track
      uploaded_file = params[:audio]
      return head :bad_request unless uploaded_file

      # Save the audio file, preventing name collision
      timestamp = Time.now.strftime("%m-%d-%y-%H-%M")
      sanitized = params[:title].parameterize
      filename  = "#{timestamp}_#{sanitized}.webm"
      filepath  = Rails.root.join('public', 'tracks', filename)

      File.open(filepath, 'wb') { |f| f.write(uploaded_file.read) }

      # Store track info
      track = Track.create title: params[:title],
                           name:  params[:name],
                           email: params[:email],
                           url:   "/tracks/#{filename}"

      render json: { track: track }, status: :created
    end

    # GET - Returns all tracks.
    def get_all_tracks
      tracks = Track.select(:id, :title, :url, :is_playing, :position, :start, :stop, :speed, :preserve_pitch, :pan, :envelope)
                    .order(:position)
                    .as_json

      render json: { tracks: tracks }
    end

    # POST - Updates the playback state.
    def update_track
      track = Track.find(params[:id])

      track.envelope       = params[:envelope]
      track.is_playing     = params[:is_playing]
      track.pan            = params[:pan]
      track.preserve_pitch = params[:preserve_pitch]
      track.speed          = params[:speed]
      track.start          = params[:start]
      track.stop           = params[:stop]
      track.save!

      render json: {}
    end

    # POST - Updates the display order.
    def update_track_order
      values = params.require(:positions).map do |p|
        "(#{p[:id].to_i}, #{p[:position].to_i})"
      end.join(", ")

      sql = <<-SQL.squish
        UPDATE tracks AS t SET position = v.position
        FROM (VALUES #{values}) AS v(id, position)
        WHERE t.id = v.id
      SQL

      ActiveRecord::Base.connection.execute(sql)

      head :ok
    end
  end
