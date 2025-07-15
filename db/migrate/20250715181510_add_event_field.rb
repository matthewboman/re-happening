class AddEventField < ActiveRecord::Migration[7.2]
  def change
    add_column :tracks, :event_name, :text

    add_index :tracks, :event_name
  end
end
