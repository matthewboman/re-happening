class ApiController < ApplicationController
    protect_from_forgery with: :null_session

    # POST - Create a new track.
    def create_track
      return head :ok if Date.today > Date.new(2025, 5, 5)

      uploaded_file = params[:audio]
      return head :bad_request unless uploaded_file

      # Save the audio file, preventing name collision
      timestamp = Time.now.strftime("%m-%d-%y-%H-%M")
      sanitized = params[:title].parameterize
      filename  = "#{timestamp}_#{sanitized}.webm"
      filepath  = Rails.root.join('public', 'tracks', filename)

      # Save webm
      webm_path = Rails.root.join('public', 'tracks', filename)
      File.open(webm_path, 'wb') { |f| f.write(uploaded_file.read) }

      # Convert to .m4a
      m4a_filename = filename.sub(/\.webm$/, '.m4a')
      m4a_path     = Rails.root.join('public', 'tracks', m4a_filename)

      # FFmpeg command
      cmd = [
        "ffmpeg",
        "-y",
        "-fflags", "+genpts",
        "-i", Shellwords.escape(webm_path.to_s),
        "-copyts",
        "-avoid_negative_ts", "make_zero",
        "-vn",
        "-acodec", "aac",
        "-b:a", "128k",
        "-movflags", "+faststart",
        Shellwords.escape(m4a_path.to_s)
      ].join(" ")

      # Run command and log output
      output = `#{cmd} 2>&1`
      Rails.logger.info("FFmpeg output:\n#{output}")

      # system("ffmpeg -i #{Shellwords.escape(webm_path.to_s)} -c:a aac -b:a 128k #{Shellwords.escape(m4a_path.to_s)}")

      # Store .m4a instead of .webm
      track = Track.create title: params[:title],
                          name:  params[:name],
                          email: params[:email],
                          url:   "/tracks/#{m4a_filename}"

      render json: { track: track }, status: :created
    end

    # GET - Returns all tracks.
    def get_all_tracks
      tracks = Track.select(:id, :title, :url, :is_playing, :position, :start, :stop, :speed, :preserve_pitch, :pan, :envelope, :updated_at)
                    .order(:position)
                    .as_json

      render json: { tracks: tracks }
    end

    # POST - Returns new tracks since page load.
    def get_new_tracks
      existing_ids = params[:existing_ids]
      tracks       = Track.where
                          .not(id: existing_ids)
                          .as_json

      render json: { new_tracks: tracks }
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

    # POST - Returns updated track data to frontend for provided tracks.
    def update_track_data
      track_ids = params[:track_ids]
      tracks    = Track.where(id: track_ids)
                       .as_json

      render json: { updated_tracks: tracks }
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
