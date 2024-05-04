{
  description = "A very basic flake";

  outputs = { self, nixpkgs }: 
  let
    system = "x86_64-linux";
    pkgs = import nixpkgs {
      inherit system;
    };
  in
  {
    devShells.${system}.default = pkgs.mkShell {
      packages = with pkgs; [
        nodejs_22
      ];
      shellHook = ''
        alias pixelflut="node index.js --image='./nixlogo.png' --offsetY=0 --offsetX=300"
      '';
    }; 
  };
}
