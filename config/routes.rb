Rails.application.routes.draw do
  get "home/index"
  get "up" => "rails/health#show", as: :rails_health_check

  root "home#index"

  get  "/api/get-all-tracks", to: "api#get_all_tracks"
  post "/api/create-track",   to: "api#create_track"
  post "/api/update-track",   to: "api#update_tracks"
end
