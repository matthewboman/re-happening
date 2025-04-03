class AddFieldsToTrack < ActiveRecord::Migration[7.2]
  def change
    add_column :tracks, :pan, :float
    add_column :tracks, :speed, :float
    add_column :tracks, :preserve_pitch, :boolean, default: true
  end
end
